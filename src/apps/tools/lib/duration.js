// Durations written the way people type them: "1:45:30", "2:20" (h:mm),
// "1天2小时30分", "1h 30m", "90s" or a bare number of seconds.
import { pad } from './dates'

const UNIT_SECONDS = [
  [/^(周|星期|w|wk|wks|weeks?)$/i, 604800],
  [/^(天|日|d|days?)$/i, 86400],
  [/^(小时|钟头|时|h|hr|hrs|hours?)$/i, 3600],
  [/^(分钟|分|m|min|mins|minutes?)$/i, 60],
  [/^(秒钟|秒|s|sec|secs|seconds?)$/i, 1]
]

const UNIT_PATTERN = /(\d+(?:\.\d+)?)\s*(周|星期|weeks?|wks?|w|天|日|days?|d|小时|钟头|时|hours?|hrs?|h|分钟|分|minutes?|mins?|m|秒钟|秒|seconds?|secs?|s)/gi

// One duration → seconds, or null when it cannot be read
export function parseDuration(text) {
  const value = String(text || '').trim()
  if (!value) {
    return null
  }
  if (/^\d+(\.\d+)?$/.test(value)) {
    return Number(value)
  }
  const clock = /^(\d+):([0-5]?\d)(?::([0-5]?\d(?:\.\d+)?))?$/.exec(value)
  if (clock) {
    return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3] || 0)
  }
  let total = 0
  let found = false
  const rest = value.replace(UNIT_PATTERN, (match, amount, unit) => {
    const [, seconds] = UNIT_SECONDS.find(([pattern]) => pattern.test(unit))
    total += Number(amount) * seconds
    found = true
    return ''
  })
  return found && !rest.replace(/[\s,，、和又零]/g, '') ? total : null
}

// "1:45:30 + 2:20 - 15m" → { seconds } or { error }
export function evaluateDurations(expression) {
  const text = String(expression || '').trim()
  if (!text) {
    return { error: '请输入时长' }
  }
  const terms = text.split(/([+\-−])/).map(part => part.trim())
  let sign = 1
  let total = 0
  let count = 0
  for (const term of terms) {
    if (term === '+' || term === '') {
      continue
    }
    if (term === '-' || term === '−') {
      sign = -sign
      continue
    }
    const seconds = parseDuration(term)
    if (seconds === null) {
      return { error: `看不懂“${term}”` }
    }
    total += sign * seconds
    sign = 1
    count++
  }
  return count ? { seconds: total, count } : { error: '请输入时长' }
}

function round(seconds) {
  return Math.round(seconds * 1000) / 1000
}

// Seconds → readable forms
export function formatDuration(totalSeconds) {
  const sign = totalSeconds < 0 ? '−' : ''
  const abs = round(Math.abs(totalSeconds))
  const whole = Math.floor(abs)
  const fraction = round(abs - whole)
  const days = Math.floor(whole / 86400)
  const hours = Math.floor((whole % 86400) / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const seconds = whole % 60 + fraction
  const parts = []
  if (days) {
    parts.push(`${days} 天`)
  }
  if (hours) {
    parts.push(`${hours} 小时`)
  }
  if (minutes) {
    parts.push(`${minutes} 分`)
  }
  if (seconds || !parts.length) {
    parts.push(`${seconds} 秒`)
  }
  const allHours = Math.floor(whole / 3600)
  return {
    text: sign + parts.join(' '),
    clock: `${sign}${allHours}:${pad(minutes)}:${pad(whole % 60)}${fraction ? String(fraction).slice(1) : ''}`,
    totals: {
      seconds: sign + abs.toLocaleString('zh-CN'),
      minutes: sign + round(abs / 60).toLocaleString('zh-CN'),
      hours: sign + round(abs / 3600).toLocaleString('zh-CN'),
      days: sign + round(abs / 86400).toLocaleString('zh-CN')
    }
  }
}
