import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { isAdmin, isConfigured, login, logout, requireAdmin } from './auth'
import { id, photoInput, placeInput, visitInput } from './validate'

const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' }
const MAX_PHOTO_BYTES = 15 * 1024 * 1024
const MAX_THUMB_BYTES = 2 * 1024 * 1024
const NOMINATIM = 'https://nominatim.openstreetmap.org'

const mediaUrl = key => (key ? `/media/${key}` : null)

function photoJson(row) {
  return {
    id: row.id,
    url: mediaUrl(row.key),
    thumb: mediaUrl(row.thumb_key),
    width: row.width,
    height: row.height,
    caption: row.caption,
    taken_at: row.taken_at,
    sort: row.sort
  }
}

function placeJson(row) {
  return {
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    country: row.country,
    region: row.region,
    city: row.city,
    category: row.category,
    rating: row.rating,
    published: Boolean(row.published),
    cover_photo_id: row.cover_photo_id,
    first_visit: row.first_visit || null,
    last_visit: row.last_visit || null,
    visit_count: row.visit_count || 0,
    cover: row.cover_key
      ? { url: mediaUrl(row.cover_key), thumb: mediaUrl(row.cover_thumb), width: row.cover_width, height: row.cover_height }
      : null
  }
}

// One row per place with its visit range and cover photo (the chosen one,
// else the first photo)
const PLACE_SUMMARY = `
  SELECT p.*,
    (SELECT MIN(start_date) FROM visits WHERE place_id = p.id) AS first_visit,
    (SELECT MAX(COALESCE(end_date, start_date)) FROM visits WHERE place_id = p.id) AS last_visit,
    (SELECT COUNT(*) FROM visits WHERE place_id = p.id) AS visit_count,
    ph.key AS cover_key, ph.thumb_key AS cover_thumb, ph.width AS cover_width, ph.height AS cover_height
  FROM places p
  LEFT JOIN photos ph ON ph.id = COALESCE(
    (SELECT id FROM photos WHERE id = p.cover_photo_id AND place_id = p.id),
    (SELECT id FROM photos WHERE place_id = p.id ORDER BY sort, id LIMIT 1))`

async function loadPlace(db, placeId, admin) {
  const row = await db.prepare(`${PLACE_SUMMARY} WHERE p.id = ?1 AND (p.published = 1 OR ?2)`).bind(placeId, admin ? 1 : 0).first()
  if (!row) {
    throw new HTTPException(404, { message: '找不到这个地方' })
  }
  const [visits, photos] = await db.batch([
    db.prepare('SELECT id, start_date, end_date, note FROM visits WHERE place_id = ? ORDER BY start_date DESC, id DESC').bind(placeId),
    db.prepare('SELECT * FROM photos WHERE place_id = ? ORDER BY sort, id').bind(placeId)
  ])
  return { ...placeJson(row), story: row.story, visits: visits.results, photos: photos.results.map(photoJson) }
}

async function placeExists(db, placeId) {
  if (!(await db.prepare('SELECT 1 FROM places WHERE id = ?').bind(placeId).first())) {
    throw new HTTPException(404, { message: '找不到这个地方' })
  }
}

async function readJson(c) {
  try {
    return await c.req.json()
  } catch (e) {
    throw new HTTPException(400, { message: '请求格式不正确' })
  }
}

function geocodeJson(item) {
  const a = item.address || {}
  return {
    name: item.name || String(item.display_name || '').split(',')[0],
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
    country: a.country || '',
    region: a.state || a.province || a.region || a.state_district || '',
    city: a.city || a.town || a.municipality || a.county || a.village || a.suburb || ''
  }
}

async function nominatim(path, params) {
  const url = `${NOMINATIM}/${path}?${new URLSearchParams({ format: 'jsonv2', addressdetails: '1', 'accept-language': 'zh-CN,zh,en', ...params })}`
  const response = await fetch(url, { headers: { 'User-Agent': 'itsblog/1.0 (+https://edgeless.me)' } })
  if (!response.ok) {
    throw new HTTPException(502, { message: '地名搜索暂时不可用' })
  }
  return response.json()
}

// ---- Public -------------------------------------------------------------

const api = new Hono()

api.get('/places', async c => {
  const admin = await isAdmin(c)
  const { results } = await c.env.DB.prepare(`${PLACE_SUMMARY} WHERE p.published = 1 OR ?1 ORDER BY last_visit DESC, p.id DESC`)
    .bind(admin ? 1 : 0).all()
  return c.json(results.map(placeJson))
})

api.get('/places/:id', async c => c.json(await loadPlace(c.env.DB, id(c.req.param('id')), await isAdmin(c))))

// ---- Session ------------------------------------------------------------

api.get('/session', async c => c.json({ configured: isConfigured(c), loggedIn: await isAdmin(c) }))

api.post('/session', async c => {
  if (c.req.header('X-Requested-With') !== 'itsblog') {
    throw new HTTPException(403, { message: 'Forbidden' })
  }
  const { password } = await readJson(c)
  await login(c, password)
  return c.json({ loggedIn: true })
})

api.delete('/session', c => {
  logout(c)
  return c.json({ loggedIn: false })
})

// ---- Admin --------------------------------------------------------------

const admin = new Hono()
admin.use('*', requireAdmin)

admin.post('/places', async c => {
  const p = placeInput(await readJson(c))
  const row = await c.env.DB.prepare(`INSERT INTO places (name, lat, lng, country, region, city, category, rating, story, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`)
    .bind(p.name, p.lat, p.lng, p.country, p.region, p.city, p.category, p.rating, p.story, p.published).first()
  return c.json(await loadPlace(c.env.DB, row.id, true), 201)
})

admin.put('/places/:id', async c => {
  const placeId = id(c.req.param('id'))
  const body = await readJson(c)
  const p = placeInput(body)
  const cover = body.cover_photo_id ? id(body.cover_photo_id) : null
  const { meta } = await c.env.DB.prepare(`UPDATE places SET name = ?, lat = ?, lng = ?, country = ?, region = ?, city = ?,
    category = ?, rating = ?, story = ?, published = ?, cover_photo_id = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(p.name, p.lat, p.lng, p.country, p.region, p.city, p.category, p.rating, p.story, p.published, cover, placeId).run()
  if (!meta.changes) {
    throw new HTTPException(404, { message: '找不到这个地方' })
  }
  return c.json(await loadPlace(c.env.DB, placeId, true))
})

admin.delete('/places/:id', async c => {
  const placeId = id(c.req.param('id'))
  const db = c.env.DB
  await placeExists(db, placeId)
  const { results } = await db.prepare('SELECT key, thumb_key FROM photos WHERE place_id = ?').bind(placeId).all()
  const keys = results.flatMap(row => [row.key, row.thumb_key])
  if (keys.length) {
    await c.env.MEDIA.delete(keys)
  }
  await db.batch([
    db.prepare('DELETE FROM photos WHERE place_id = ?').bind(placeId),
    db.prepare('DELETE FROM visits WHERE place_id = ?').bind(placeId),
    db.prepare('DELETE FROM places WHERE id = ?').bind(placeId)
  ])
  return c.body(null, 204)
})

admin.post('/places/:id/visits', async c => {
  const placeId = id(c.req.param('id'))
  await placeExists(c.env.DB, placeId)
  const v = visitInput(await readJson(c))
  await c.env.DB.prepare('INSERT INTO visits (place_id, start_date, end_date, note) VALUES (?, ?, ?, ?)')
    .bind(placeId, v.start_date, v.end_date, v.note).run()
  return c.json(await loadPlace(c.env.DB, placeId, true), 201)
})

admin.put('/visits/:id', async c => {
  const visitId = id(c.req.param('id'))
  const v = visitInput(await readJson(c))
  const row = await c.env.DB.prepare('UPDATE visits SET start_date = ?, end_date = ?, note = ? WHERE id = ? RETURNING place_id')
    .bind(v.start_date, v.end_date, v.note, visitId).first()
  if (!row) {
    throw new HTTPException(404, { message: '找不到这次到访' })
  }
  return c.json(await loadPlace(c.env.DB, row.place_id, true))
})

admin.delete('/visits/:id', async c => {
  const row = await c.env.DB.prepare('DELETE FROM visits WHERE id = ? RETURNING place_id').bind(id(c.req.param('id'))).first()
  if (!row) {
    throw new HTTPException(404, { message: '找不到这次到访' })
  }
  return c.json(await loadPlace(c.env.DB, row.place_id, true))
})

// The browser uploads the resized photo and its thumbnail together
admin.post('/places/:id/photos', async c => {
  const placeId = id(c.req.param('id'))
  await placeExists(c.env.DB, placeId)
  const form = await c.req.formData()
  const photo = form.get('photo')
  const thumb = form.get('thumb')
  for (const [file, max] of [[photo, MAX_PHOTO_BYTES], [thumb, MAX_THUMB_BYTES]]) {
    if (!file || typeof file === 'string' || !IMAGE_TYPES[file.type]) {
      throw new HTTPException(400, { message: '只能上传 JPEG、PNG、WebP、GIF 或 AVIF 图片' })
    }
    if (file.size > max) {
      throw new HTTPException(413, { message: '图片太大了' })
    }
  }
  const meta = photoInput({ caption: form.get('caption'), taken_at: form.get('taken_at') || null })
  const base = `places/${placeId}/${crypto.randomUUID()}`
  const key = `${base}.${IMAGE_TYPES[photo.type]}`
  const thumbKey = `${base}-thumb.${IMAGE_TYPES[thumb.type]}`
  const httpMetadata = type => ({ contentType: type, cacheControl: 'public, max-age=31536000, immutable' })
  await Promise.all([
    c.env.MEDIA.put(key, photo.stream(), { httpMetadata: httpMetadata(photo.type) }),
    c.env.MEDIA.put(thumbKey, thumb.stream(), { httpMetadata: httpMetadata(thumb.type) })
  ])
  const width = Math.round(Number(form.get('width'))) || null
  const height = Math.round(Number(form.get('height'))) || null
  const { next } = await c.env.DB.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS next FROM photos WHERE place_id = ?').bind(placeId).first()
  await c.env.DB.prepare('INSERT INTO photos (place_id, key, thumb_key, width, height, caption, taken_at, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(placeId, key, thumbKey, width, height, meta.caption, meta.taken_at, next).run()
  return c.json(await loadPlace(c.env.DB, placeId, true), 201)
})

admin.put('/photos/:id', async c => {
  const photoId = id(c.req.param('id'))
  const meta = photoInput(await readJson(c))
  const row = await c.env.DB.prepare('UPDATE photos SET caption = ?, taken_at = ?, sort = ? WHERE id = ? RETURNING place_id')
    .bind(meta.caption, meta.taken_at, meta.sort, photoId).first()
  if (!row) {
    throw new HTTPException(404, { message: '找不到这张照片' })
  }
  return c.json(await loadPlace(c.env.DB, row.place_id, true))
})

admin.delete('/photos/:id', async c => {
  const photoId = id(c.req.param('id'))
  const db = c.env.DB
  const row = await db.prepare('SELECT place_id, key, thumb_key FROM photos WHERE id = ?').bind(photoId).first()
  if (!row) {
    throw new HTTPException(404, { message: '找不到这张照片' })
  }
  await c.env.MEDIA.delete([row.key, row.thumb_key])
  await db.batch([
    db.prepare('DELETE FROM photos WHERE id = ?').bind(photoId),
    db.prepare('UPDATE places SET cover_photo_id = NULL WHERE id = ? AND cover_photo_id = ?').bind(row.place_id, photoId)
  ])
  return c.json(await loadPlace(db, row.place_id, true))
})

// Place-name search for the editor, via OpenStreetMap Nominatim
admin.get('/geocode', async c => {
  const q = (c.req.query('q') || '').trim()
  if (!q) {
    return c.json([])
  }
  const results = await nominatim('search', { q: q.slice(0, 200), limit: '6' })
  return c.json(results.map(geocodeJson))
})

admin.get('/reverse', async c => {
  const lat = Number(c.req.query('lat'))
  const lng = Number(c.req.query('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new HTTPException(400, { message: '坐标不正确' })
  }
  const result = await nominatim('reverse', { lat: String(lat), lon: String(lng), zoom: '14' })
  return c.json(result && !result.error ? geocodeJson(result) : null)
})

api.route('/admin', admin)

export default api
