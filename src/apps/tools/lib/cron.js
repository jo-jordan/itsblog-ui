// Standard five-field cron (minute hour day-of-month month day-of-week) with
// Vixie cron semantics: lists, ranges, steps, JAN–DEC / SUN–SAT names, 7 = Sunday,
// and the day-of-month / day-of-week rule — when both fields are restricted a
// day matches either one; when either field starts with "*" both must match.
import { addDays, pad, weekday } from './dates'
import { zonedToEpoch, zoneParts } from './zones'

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六', '日']

export const FIELDS = [
  { key: 'minute', label: '分钟', min: 0, max: 59, unit: '分钟', format: v => `${v} 分` },
  { key: 'hour', label: '小时', min: 0, max: 23, unit: '小时', format: v => `${v} 点` },
  { key: 'dom', label: '日', min: 1, max: 31, unit: '天', format: v => `${v} 日` },
  { key: 'month', label: '月', min: 1, max: 12, unit: '个月', format: v => `${v} 月`, names: MONTH_NAMES, nameBase: 1 },
  { key: 'dow', label: '星期', min: 0, max: 7, unit: '天', format: v => `周${WEEK_CN[v]}`, names: DAY_NAMES, nameBase: 0 }
]

export const MACROS = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *'
}

class CronError extends Error {}

function parseNumber(text, field) {
  const upper = text.toUpperCase()
  if (field.names) {
    const index = field.names.indexOf(upper)
    if (index > -1) {
      return index + field.nameBase
    }
  }
  if (!/^\d+$/.test(text)) {
    throw new CronError(`${field.label}字段中的“${text}”不是有效的数字${field.names ? '或名称' : ''}`)
  }
  const value = +text
  if (value < field.min || value > field.max) {
    throw new CronError(`${field.label}字段的取值范围是 ${field.min}–${field.max}，“${text}”超出范围`)
  }
  return value
}

// One field → { values: Set, tokens: [...], star: starts with "*" }
function parseField(text, field) {
  if (!text) {
    throw new CronError(`缺少${field.label}字段`)
  }
  const values = new Set()
  const tokens = text.split(',').map(part => {
    if (!part) {
      throw new CronError(`${field.label}字段中有多余的逗号`)
    }
    const [rangeText, stepText, extra] = part.split('/')
    if (extra !== undefined) {
      throw new CronError(`${field.label}字段中的“${part}”有多个“/”`)
    }
    let step = 1
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText) || +stepText === 0) {
        throw new CronError(`${field.label}字段中的步长“${stepText}”必须是正整数`)
      }
      step = +stepText
    }
    let from
    let to
    let type
    if (rangeText === '*' || (rangeText === '?' && (field.key === 'dom' || field.key === 'dow'))) {
      type = 'all'
      from = field.min
      to = field.key === 'dow' ? 6 : field.max
    } else if (rangeText.includes('-')) {
      const [a, b, more] = rangeText.split('-')
      if (more !== undefined || !a || !b) {
        throw new CronError(`${field.label}字段中的范围“${rangeText}”无效`)
      }
      type = 'range'
      from = parseNumber(a, field)
      to = parseNumber(b, field)
      if (from > to) {
        throw new CronError(`${field.label}字段中的范围“${rangeText}”起点大于终点`)
      }
    } else {
      from = parseNumber(rangeText, field)
      // "5/15" is read as "5-max/15", as cronie and most modern crons do
      type = stepText === undefined ? 'value' : 'range'
      to = stepText === undefined ? from : field.key === 'dow' ? 7 : field.max
    }
    for (let v = from; v <= to; v += step) {
      values.add(field.key === 'dow' && v === 7 ? 0 : v)
    }
    return { type, from, to, step }
  })
  return { values, tokens, star: text[0] === '*' || text[0] === '?' }
}

export function parseCron(expression) {
  let text = String(expression || '').trim().replace(/\s+/g, ' ')
  if (!text) {
    throw new CronError('请输入 cron 表达式')
  }
  const macro = text.toLowerCase()
  if (macro === '@reboot') {
    throw new CronError('@reboot 只在系统启动时执行一次，无法推算时间')
  }
  if (macro[0] === '@') {
    if (!MACROS[macro]) {
      throw new CronError(`不认识的简写“${text}”`)
    }
    text = MACROS[macro]
  }
  const parts = text.split(' ')
  if (parts.length !== 5) {
    throw new CronError(`标准 cron 表达式需要 5 个字段（分 时 日 月 周），这里有 ${parts.length} 个`)
  }
  const fields = {}
  FIELDS.forEach((field, index) => {
    fields[field.key] = { ...parseField(parts[index], field), raw: parts[index] }
  })
  return { expression: text, fields }
}

export function isFull(parsed, key) {
  const field = FIELDS.find(item => item.key === key)
  const size = key === 'dow' ? 7 : field.max - field.min + 1
  return parsed.fields[key].values.size === size
}

export function dayMatches(parsed, date) {
  const { dom, dow, month } = parsed.fields
  if (!month.values.has(date.m)) {
    return false
  }
  const domHit = dom.values.has(date.d)
  const dowHit = dow.values.has(weekday(date))
  return dom.star || dow.star ? domHit && dowHit : domHit || dowHit
}

// ---- Description in Chinese ------------------------------------------------------

// Joins Chinese text, with a space only where it meets a number ("每月 1 日", "周一至周五")
function glue(...parts) {
  return parts.filter(Boolean).reduce((text, part) => {
    if (/[\d:]$/.test(text) || /^\d/.test(part)) {
      return text.endsWith(' ') ? text + part : `${text} ${part}`
    }
    return text + part
  }, '')
}

function joinRange(from, to) {
  return glue(from, '至', to)
}

function tokenText(token, field) {
  if (token.type === 'all') {
    if (token.step === 1) {
      return `每${field.unit}`
    }
    return field.key === 'dom' ? `从 1 日起每隔 ${token.step} 天` : `每隔 ${token.step} ${field.unit}`
  }
  if (token.type === 'value') {
    return field.format(token.from)
  }
  const range = joinRange(field.format(token.from), field.format(token.to === 7 && field.key === 'dow' ? 0 : token.to))
  return token.step === 1 ? range : `${range}之间每隔 ${token.step} ${field.unit}`
}

function fieldText(parsed, key) {
  const field = FIELDS.find(item => item.key === key)
  return parsed.fields[key].tokens.map(token => tokenText(token, field)).join('、')
}

function sortedValues(parsed, key) {
  return [...parsed.fields[key].values].sort((a, b) => a - b)
}

function tokensAre(parsed, key, test) {
  return parsed.fields[key].tokens.every(test)
}

function onlyValues(parsed, key) {
  return tokensAre(parsed, key, token => token.type === 'value')
}

function minuteText(parsed) {
  if (isFull(parsed, 'minute')) {
    return '每分钟'
  }
  if (onlyValues(parsed, 'minute')) {
    const minutes = sortedValues(parsed, 'minute')
    return minutes.length === 1 && minutes[0] === 0 ? '整点' : `第 ${minutes.join('、')} 分`
  }
  return fieldText(parsed, 'minute')
}

function timeText(parsed) {
  const minutes = sortedValues(parsed, 'minute')
  const hours = sortedValues(parsed, 'hour')
  if (onlyValues(parsed, 'minute') && onlyValues(parsed, 'hour') && minutes.length * hours.length <= 8) {
    const times = []
    hours.forEach(h => minutes.forEach(m => times.push(`${pad(h)}:${pad(m)}`)))
    return times.join('、')
  }
  const minute = minuteText(parsed)
  if (isFull(parsed, 'hour')) {
    // "*/15 * …" reads "每隔 15 分钟"; anything else is "每小时的…"
    return tokensAre(parsed, 'minute', token => token.type === 'all') ? minute : glue('每小时的', minute)
  }
  const hour = onlyValues(parsed, 'hour') ? hours.map(h => `${h} 点`).join('、') : fieldText(parsed, 'hour')
  return glue(hour, '的', minute)
}

// Weekdays as a list when steps make the tokens hard to read ("*/2" → 周日、周二…)
function weekText(parsed) {
  if (tokensAre(parsed, 'dow', token => token.step === 1 && token.type !== 'all')) {
    return fieldText(parsed, 'dow')
  }
  return sortedValues(parsed, 'dow').map(v => `周${WEEK_CN[v]}`).join('、')
}

function dayText(parsed, inMonths) {
  const { dom, dow } = parsed.fields
  const domFull = isFull(parsed, 'dom')
  const dowFull = isFull(parsed, 'dow')
  const domText = glue(inMonths ? '' : '每月', fieldText(parsed, 'dom'))
  if (domFull && dowFull) {
    return ''
  }
  if (dom.star || dow.star) {
    if (!domFull && !dowFull) {
      return `${domText}，且逢${weekText(parsed)}`
    }
    return domFull ? `每${weekText(parsed)}` : domText
  }
  return `${domText}，或每${weekText(parsed)}`
}

export function describeCron(parsed) {
  const month = isFull(parsed, 'month') ? '' : glue('每年', fieldText(parsed, 'month'))
  const day = dayText(parsed, Boolean(month))
  const time = timeText(parsed)
  const everyHour = tokensAre(parsed, 'hour', token => token.type === 'all')
  let when
  if (month && day) {
    when = isFull(parsed, 'dow') && !day.includes('，') ? glue(month, day) : glue(month, '的', day)
  } else if (month) {
    when = everyHour ? `${month}，` : `${month}，每天`
  } else {
    when = day || (everyHour ? '' : '每天')
  }
  return glue(when, when && !when.endsWith('，') && !/^\d/.test(time) ? ' ' : '', time, '执行').replace(/\s+/g, ' ')
}

// What each field allows, for the breakdown table
export function fieldSummary(parsed) {
  return FIELDS.map(field => {
    const values = sortedValues(parsed, field.key)
    const full = isFull(parsed, field.key)
    let list
    if (full) {
      list = '全部'
    } else if (field.key === 'dow') {
      list = values.map(v => `周${WEEK_CN[v]}`).join('、')
    } else {
      list = values.join(', ')
    }
    return { key: field.key, label: field.label, raw: parsed.fields[field.key].raw, text: fieldText(parsed, field.key), list }
  })
}

// ---- Next run times ------------------------------------------------------------------

// The next `count` runs strictly after `from` (epoch ms), evaluated on the zone's wall clock.
// Wall times skipped by a DST jump are left out, as Vixie cron would skip them.
export function nextRuns(parsed, zone, count = 10, from = Date.now()) {
  const start = zoneParts(from, zone)
  const minutes = sortedValues(parsed, 'minute')
  const hours = sortedValues(parsed, 'hour')
  const runs = []
  let date = { y: start.y, m: start.m, d: start.d }
  // 28 years covers every combination of date and weekday (e.g. 2 月 29 日 + 周一)
  for (let i = 0; i < 366 * 28 && runs.length < count; i++, date = addDays(date, 1)) {
    if (!dayMatches(parsed, date)) {
      continue
    }
    for (const h of hours) {
      for (const mi of minutes) {
        const result = zonedToEpoch({ y: date.y, m: date.m, d: date.d, h, mi, s: 0 }, zone)
        if (result.valid && result.epoch > from) {
          runs.push(result.epoch)
          if (runs.length >= count) {
            return runs
          }
        }
      }
    }
  }
  return runs
}

export { CronError }
