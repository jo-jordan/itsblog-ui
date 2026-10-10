import { apiError } from './messages'

export const CATEGORIES = ['city', 'nature', 'landmark', 'food', 'other']
const DATE = /^\d{4}-\d{2}-\d{2}$/

// `field` names a label in messages.js
function fail(key, params) {
  throw apiError(400, key, params)
}

function text(value, field, max, { required = false } = {}) {
  const result = value == null ? '' : String(value).trim()
  if (required && !result) fail('required', { field })
  if (result.length > max) fail('tooLong', { field, max })
  return result
}

function number(value, field, min, max) {
  const result = Number(value)
  if (value === '' || value == null || !Number.isFinite(result) || result < min || result > max) {
    fail('range', { field, min, max })
  }
  return result
}

function date(value, field, { required = false } = {}) {
  if (value == null || value === '') {
    if (required) fail('required', { field })
    return null
  }
  if (!DATE.test(value) || Number.isNaN(Date.parse(value))) fail('dateFormat', { field })
  return value
}

export function placeInput(body) {
  const category = body.category || 'city'
  if (!CATEGORIES.includes(category)) fail('unknownCategory')
  const rating = body.rating == null || body.rating === '' ? null : number(body.rating, 'rating', 1, 5)
  return {
    name: text(body.name, 'name', 100, { required: true }),
    lat: number(body.lat, 'lat', -90, 90),
    lng: number(body.lng, 'lng', -180, 180),
    country: text(body.country, 'country', 60),
    region: text(body.region, 'region', 60),
    city: text(body.city, 'city', 60),
    category,
    rating: rating && Math.round(rating),
    story: text(body.story, 'story', 20000),
    published: body.published === false || body.published === 0 ? 0 : 1
  }
}

export function visitInput(body) {
  const start = date(body.start_date, 'startDate', { required: true })
  const end = date(body.end_date, 'endDate')
  if (end && end < start) fail('endBeforeStart')
  return { start_date: start, end_date: end, note: text(body.note, 'note', 500) }
}

export function photoInput(body) {
  return {
    caption: text(body.caption, 'caption', 300),
    taken_at: date(body.taken_at, 'takenAt'),
    sort: body.sort == null || body.sort === '' ? 0 : Math.round(number(body.sort, 'sort', -100000, 100000))
  }
}

export function id(value) {
  const result = Number(value)
  if (!Number.isInteger(result) || result < 1) throw apiError(404, 'notFound')
  return result
}
