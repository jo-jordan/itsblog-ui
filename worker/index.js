import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import api from './api'
import { errorMessage, message, requestLocale } from './messages'

// Runs in front of the static Vue build: canonicalises www.edgeless.me,
// serves the footprints API and its photos, and hands everything else to
// the asset server.
const app = new Hono()

app.use('*', async(c, next) => {
  const url = new URL(c.req.url)
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4)
    return c.redirect(url.toString(), 301)
  }
  await next()
})

app.route('/api', api)
app.all('/api/*', c => c.json({ error: 'Not found' }, 404))

// Photos live in R2 under unguessable, never-reused keys
app.get('/media/*', async c => {
  const key = decodeURIComponent(new URL(c.req.url).pathname.slice('/media/'.length))
  if (!key.startsWith('places/')) {
    return c.notFound()
  }
  const object = await c.env.MEDIA.get(key, { onlyIf: c.req.raw.headers })
  if (!object) {
    return c.text('Not found', 404)
  }
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  // A conditional request that matched has no body: tell the browser to reuse its copy
  return 'body' in object && object.body ? new Response(object.body, { headers }) : new Response(null, { status: 304, headers })
})

app.all('*', c => c.env.ASSETS.fetch(c.req.raw))

// Errors thrown anywhere in the API end up here (the sub-apps have no handler
// of their own) and are worded in the visitor's language
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: errorMessage(c, err) }, err.status)
  }
  console.error(err)
  return c.json({ error: message(requestLocale(c), 'serverError') }, 500)
})

export default app
