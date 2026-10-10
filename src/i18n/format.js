// Dates and numbers in the current language. Dates are plain { y, m, d }
// objects or 'YYYY-MM-DD' strings, formatted in UTC so no time zone shifts them.
import { currentLocale, t, tm } from './index'

const formatters = {}

function formatter(options) {
  const key = `${currentLocale()}|${JSON.stringify(options)}`
  if (!formatters[key]) {
    formatters[key] = new Intl.DateTimeFormat(currentLocale(), { ...options, timeZone: 'UTC' })
  }
  return formatters[key]
}

function toUtc(date) {
  const js = new Date(0)
  // setUTCFullYear keeps years below 100 intact
  js.setUTCFullYear(date.y, date.m - 1, date.d)
  return js
}

function toPlain(date) {
  if (typeof date !== 'string') {
    return date
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  return match ? { y: +match[1], m: +match[2], d: +match[3] } : null
}

function format(date, options) {
  const plain = toPlain(date)
  return plain ? formatter(options).format(toUtc(plain)) : String(date || '')
}

// 2026年10月8日 / October 8, 2026
export function formatLongDate(date) {
  return format(date, { year: 'numeric', month: 'long', day: 'numeric' })
}

// 10月8日 / Oct 8 (the year of `date` is ignored)
export function formatMonthDay(date) {
  return format({ y: 2000, ...toPlain(date) }, { month: 'short', day: 'numeric' })
}

// 2026年10月 / October 2026
export function formatYearMonth(date) {
  return format({ d: 1, ...toPlain(date) }, { year: 'numeric', month: 'long' })
}

// 0 = Sunday … 6 = Saturday. long: 星期三 / Wednesday, short: 周三 / Wed, narrow: 三 / W
export function weekdayName(weekday, style = 'short') {
  return tm(`date.weekdays.${style}`)[weekday]
}

// 1,234 in both languages, but spelled by the current one
export function formatNumber(value, options) {
  return Number(value).toLocaleString(currentLocale(), options)
}

const RELATIVE_UNITS = [
  [365.2425 * 86400000, 'year'],
  [30.436875 * 86400000, 'month'],
  [86400000, 'day'],
  [3600000, 'hour'],
  [60000, 'minute'],
  [1000, 'second']
]

// "3 天前 / in 2 hours" for a difference in milliseconds
export function relativeTime(ms) {
  const abs = Math.abs(ms)
  if (abs < 1000) {
    return t('date.now')
  }
  const [size, unit] = RELATIVE_UNITS.find(([unitSize]) => abs >= unitSize)
  const amount = Math.floor(abs / size) * (ms > 0 ? 1 : -1)
  return new Intl.RelativeTimeFormat(currentLocale(), { numeric: 'always' }).format(amount, unit)
}
