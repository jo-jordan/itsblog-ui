import { HTTPException } from 'hono/http-exception'

export const CATEGORIES = ['city', 'nature', 'landmark', 'food', 'other']
const DATE = /^\d{4}-\d{2}-\d{2}$/

function fail(message) {
  throw new HTTPException(400, { message })
}

function text(value, label, max, { required = false } = {}) {
  const result = value == null ? '' : String(value).trim()
  if (required && !result) fail(`${label}不能为空`)
  if (result.length > max) fail(`${label}太长了（最多 ${max} 字）`)
  return result
}

function number(value, label, min, max) {
  const result = Number(value)
  if (value === '' || value == null || !Number.isFinite(result) || result < min || result > max) {
    fail(`${label}应在 ${min} 到 ${max} 之间`)
  }
  return result
}

function date(value, label, { required = false } = {}) {
  if (value == null || value === '') {
    if (required) fail(`${label}不能为空`)
    return null
  }
  if (!DATE.test(value) || Number.isNaN(Date.parse(value))) fail(`${label}格式应为 YYYY-MM-DD`)
  return value
}

export function placeInput(body) {
  const category = body.category || 'city'
  if (!CATEGORIES.includes(category)) fail('未知的类别')
  const rating = body.rating == null || body.rating === '' ? null : number(body.rating, '评分', 1, 5)
  return {
    name: text(body.name, '名称', 100, { required: true }),
    lat: number(body.lat, '纬度', -90, 90),
    lng: number(body.lng, '经度', -180, 180),
    country: text(body.country, '国家/地区', 60),
    region: text(body.region, '省/州', 60),
    city: text(body.city, '城市', 60),
    category,
    rating: rating && Math.round(rating),
    story: text(body.story, '游记', 20000),
    published: body.published === false || body.published === 0 ? 0 : 1
  }
}

export function visitInput(body) {
  const start = date(body.start_date, '开始日期', { required: true })
  const end = date(body.end_date, '结束日期')
  if (end && end < start) fail('结束日期不能早于开始日期')
  return { start_date: start, end_date: end, note: text(body.note, '备注', 500) }
}

export function photoInput(body) {
  return {
    caption: text(body.caption, '说明', 300),
    taken_at: date(body.taken_at, '拍摄日期'),
    sort: body.sort == null || body.sort === '' ? 0 : Math.round(number(body.sort, '排序', -100000, 100000))
  }
}

export function id(value) {
  const result = Number(value)
  if (!Number.isInteger(result) || result < 1) throw new HTTPException(404, { message: '找不到' })
  return result
}
