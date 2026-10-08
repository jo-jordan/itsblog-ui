// Calendar arithmetic on plain dates ({ y, m, d }), free of time zones and
// daylight saving: every calculation goes through a day number in UTC.

const DAY = 86400000

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export const pad = (n, width = 2) => String(n).padStart(width, '0')

export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

export function daysInMonth(y, m) {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
}

export function isValidDate(date) {
  return Boolean(date) && Number.isInteger(date.y) && Number.isInteger(date.m) && Number.isInteger(date.d) &&
    date.y >= 1 && date.y <= 9999 && date.m >= 1 && date.m <= 12 && date.d >= 1 && date.d <= daysInMonth(date.y, date.m)
}

// 'YYYY-MM-DD' (the value of <input type="date">) → { y, m, d }, or null
export function parseYmd(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || '').trim())
  if (!match) {
    return null
  }
  const date = { y: +match[1], m: +match[2], d: +match[3] }
  return isValidDate(date) ? date : null
}

export function formatYmd(date) {
  return `${pad(date.y, 4)}-${pad(date.m)}-${pad(date.d)}`
}

export function formatChinese(date) {
  return `${date.y}年${date.m}月${date.d}日`
}

export function fromJsDate(js) {
  return { y: js.getFullYear(), m: js.getMonth() + 1, d: js.getDate() }
}

export function today() {
  return fromJsDate(new Date())
}

// Days since 1970-01-01 (setUTCFullYear keeps years below 100 intact)
export function dayNumber(date) {
  const js = new Date(0)
  js.setUTCFullYear(date.y, date.m - 1, date.d)
  return Math.round(js.getTime() / DAY)
}

export function fromDayNumber(n) {
  const js = new Date(n * DAY)
  return { y: js.getUTCFullYear(), m: js.getUTCMonth() + 1, d: js.getUTCDate() }
}

export function addDays(date, n) {
  return fromDayNumber(dayNumber(date) + n)
}

// Calendar months, clamped to the end of shorter months (1月31日 + 1 个月 = 2月28/29日)
export function addMonths(date, n) {
  const index = date.y * 12 + (date.m - 1) + n
  const y = Math.floor(index / 12)
  const m = index - y * 12 + 1
  return { y, m, d: Math.min(date.d, daysInMonth(y, m)) }
}

export function compare(a, b) {
  return dayNumber(a) - dayNumber(b)
}

export function sameDay(a, b) {
  return a.y === b.y && a.m === b.m && a.d === b.d
}

// 0 = Sunday … 6 = Saturday; 1970-01-01 was a Thursday
export function weekday(date) {
  return (((dayNumber(date) + 4) % 7) + 7) % 7
}

export function isWeekend(date) {
  const w = weekday(date)
  return w === 0 || w === 6
}

export function dayOfYear(date) {
  return dayNumber(date) - dayNumber({ y: date.y, m: 1, d: 1 }) + 1
}

// ISO 8601 week: weeks start on Monday and week 1 contains the year's first Thursday
export function isoWeek(date) {
  const isoDay = weekday(date) || 7
  const thursday = addDays(date, 4 - isoDay)
  const week = Math.floor((dayOfYear(thursday) - 1) / 7) + 1
  return { year: thursday.y, week }
}

// Whole months from a to b (a ≤ b) such that a + months does not pass b
function wholeMonths(a, b) {
  let months = (b.y - a.y) * 12 + (b.m - a.m)
  if (months > 0 && compare(addMonths(a, months), b) > 0) {
    months--
  }
  return Math.max(0, months)
}

// Breakdown of the span between two dates in years / months / days
export function span(a, b) {
  const sign = compare(b, a) < 0 ? -1 : 1
  const [from, to] = sign < 0 ? [b, a] : [a, b]
  const days = dayNumber(to) - dayNumber(from)
  const months = wholeMonths(from, to)
  const monthsRest = dayNumber(to) - dayNumber(addMonths(from, months))
  return {
    sign,
    days,
    weeks: Math.floor(days / 7),
    weekDays: days % 7,
    months,
    monthsRest,
    years: Math.floor(months / 12),
    yearMonths: months % 12
  }
}

// Mon–Fri between a and b inclusive (a ≤ b), without walking every day
export function countWeekdays(a, b) {
  const start = dayNumber(a)
  const end = dayNumber(b)
  if (end < start) {
    return 0
  }
  const total = end - start + 1
  const full = Math.floor(total / 7)
  let count = full * 5
  for (let n = start + full * 7; n <= end; n++) {
    const w = (((n + 4) % 7) + 7) % 7
    if (w !== 0 && w !== 6) {
      count++
    }
  }
  return count
}

// Next occurrence (on or after `from`) of a yearly month/day; 2 月 29 日 falls on
// 2 月 28 日 in common years
export function nextAnniversary(m, d, from) {
  for (let y = from.y; y <= from.y + 1; y++) {
    const date = { y, m, d: Math.min(d, daysInMonth(y, m)) }
    if (compare(date, from) >= 0) {
      return date
    }
  }
  return null
}

// Short Chinese "3 天前 / 2 小时后" for a difference in milliseconds
export function relativeTime(ms) {
  const future = ms > 0
  const abs = Math.abs(ms)
  const units = [
    [365.2425 * DAY, '年'],
    [30.436875 * DAY, '个月'],
    [DAY, '天'],
    [3600000, '小时'],
    [60000, '分钟'],
    [1000, '秒']
  ]
  if (abs < 1000) {
    return '现在'
  }
  const [size, name] = units.find(([unitSize]) => abs >= unitSize)
  return `${Math.floor(abs / size)} ${name}${future ? '后' : '前'}`
}
