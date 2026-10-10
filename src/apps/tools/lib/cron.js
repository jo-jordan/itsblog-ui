// Standard five-field cron (minute hour day-of-month month day-of-week) with
// Vixie cron semantics: lists, ranges, steps, JAN–DEC / SUN–SAT names, 7 = Sunday,
// and the day-of-month / day-of-week rule — when both fields are restricted a
// day matches either one; when either field starts with "*" both must match.
import { addDays, pad, weekday } from './dates'
import { currentLocale, t, tc, weekdayName } from './i18n'
import { zonedToEpoch, zoneParts } from './zones'

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Labels and wording for each field are in the locale files (tools.cron.fields.<key>)
export const FIELDS = [
  { key: 'minute', min: 0, max: 59 },
  { key: 'hour', min: 0, max: 23 },
  { key: 'dom', min: 1, max: 31 },
  { key: 'month', min: 1, max: 12, names: MONTH_NAMES, nameBase: 1 },
  { key: 'dow', min: 0, max: 7, names: DAY_NAMES, nameBase: 0 }
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

const message = (key, values) => t(`tools.cron.${key}`, values)
const phrase = (key, values) => message(`phrases.${key}`, values)
const fieldLabel = field => message(`fields.${field.key}.label`)

// Errors are worded when thrown, so parse again after the language changes
function fail(key, field, values) {
  return new CronError(message(`errors.${key}`, { field: field && fieldLabel(field), ...values }))
}

function parseNumber(text, field) {
  const upper = text.toUpperCase()
  if (field.names) {
    const index = field.names.indexOf(upper)
    if (index > -1) {
      return index + field.nameBase
    }
  }
  if (!/^\d+$/.test(text)) {
    throw fail(field.names ? 'notNumberOrName' : 'notNumber', field, { text })
  }
  const value = +text
  if (value < field.min || value > field.max) {
    throw fail('outOfRange', field, { text, min: field.min, max: field.max })
  }
  return value
}

// One field → { values: Set, tokens: [...], star: starts with "*" }
function parseField(text, field) {
  if (!text) {
    throw fail('missing', field)
  }
  const values = new Set()
  const tokens = text.split(',').map(part => {
    if (!part) {
      throw fail('extraComma', field)
    }
    const [rangeText, stepText, extra] = part.split('/')
    if (extra !== undefined) {
      throw fail('manySlashes', field, { text: part })
    }
    let step = 1
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText) || +stepText === 0) {
        throw fail('badStep', field, { text: stepText })
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
        throw fail('badRange', field, { text: rangeText })
      }
      type = 'range'
      from = parseNumber(a, field)
      to = parseNumber(b, field)
      if (from > to) {
        throw fail('reversedRange', field, { text: rangeText })
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
    throw fail('empty')
  }
  const macro = text.toLowerCase()
  if (macro === '@reboot') {
    throw fail('reboot', null, { macro: '@reboot' })
  }
  if (macro[0] === '@') {
    if (!MACROS[macro]) {
      throw fail('unknownMacro', null, { text })
    }
    text = MACROS[macro]
  }
  const parts = text.split(' ')
  if (parts.length !== 5) {
    throw fail('fieldCount', null, { n: parts.length })
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

// ---- What a field allows, in the current language -----------------------------------

// "a, b and c", or however the language lists things
function list(items) {
  if (items.length < 2) {
    return items.join('')
  }
  return items.slice(0, -1).join(message('list.separator')) + message('list.last') + items[items.length - 1]
}

function ordinal(n) {
  let rule = 'other'
  try {
    rule = new Intl.PluralRules(currentLocale(), { type: 'ordinal' }).select(n)
  } catch (e) {
    // No ordinal rules in this browser
  }
  return message(`ordinals.${rule}`, { n })
}

// A value as the name it stands for: a month, a weekday (7 = Sunday), the 1st, or just the number
function valueName(field, value) {
  if (field.key === 'month') {
    return message('months')[value - 1]
  }
  if (field.key === 'dow') {
    return message('weekdays')[value % 7]
  }
  return field.key === 'dom' ? ordinal(value) : String(value)
}

function valueText(field, value) {
  return message(`fields.${field.key}.value`, { v: value, name: valueName(field, value) })
}

function tokenText(token, field) {
  const base = `fields.${field.key}`
  if (token.type === 'all') {
    return token.step === 1 ? message(`${base}.every`) : message(`${base}.step`, { n: token.step })
  }
  if (token.type === 'value') {
    return valueText(field, token.from)
  }
  const slots = {
    n: token.step,
    from: token.from,
    // A weekday range may end on 7, which is Sunday again
    to: field.key === 'dow' ? token.to % 7 : token.to,
    fromName: valueName(field, token.from),
    toName: valueName(field, token.to)
  }
  const range = message(`${base}.range`, slots)
  return token.step === 1 ? range : message(`${base}.rangeStep`, { ...slots, range })
}

function fieldText(parsed, key) {
  const field = FIELDS.find(item => item.key === key)
  return list(parsed.fields[key].tokens.map(token => tokenText(token, field)))
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

// A single value or a plain range, without "*" or a step
const isSimple = token => token.type !== 'all' && token.step === 1

function clockTimes(hours, minutes) {
  const times = []
  hours.forEach(h => minutes.forEach(m => times.push(`${pad(h)}:${pad(m)}`)))
  return times
}

// ---- Description -----------------------------------------------------------------
// Each language builds its own sentence: Chinese runs month → day → time → verb,
// English time → day → month, and they do not group the same cases.

// Joins Chinese text, with a space only where it meets a number
function glue(...parts) {
  return parts.filter(Boolean).reduce((text, part) => {
    if (/[\d:]$/.test(text) || /^\d/.test(part)) {
      return text.endsWith(' ') ? text + part : `${text} ${part}`
    }
    return text + part
  }, '')
}

function chineseMinutes(parsed) {
  if (isFull(parsed, 'minute')) {
    return phrase('everyMinute')
  }
  if (onlyValues(parsed, 'minute')) {
    const minutes = sortedValues(parsed, 'minute')
    return minutes.length === 1 && minutes[0] === 0 ? phrase('onTheHour') : phrase('atMinutes', { minutes: list(minutes) })
  }
  return fieldText(parsed, 'minute')
}

function chineseTime(parsed) {
  const minutes = sortedValues(parsed, 'minute')
  const hours = sortedValues(parsed, 'hour')
  if (onlyValues(parsed, 'minute') && onlyValues(parsed, 'hour') && minutes.length * hours.length <= 8) {
    return list(clockTimes(hours, minutes))
  }
  const minute = chineseMinutes(parsed)
  if (isFull(parsed, 'hour')) {
    // "*/15 * …" is just "every 15 minutes"; anything else is "… of every hour"
    return tokensAre(parsed, 'minute', token => token.type === 'all') ? minute : glue(phrase('ofEveryHour'), minute)
  }
  const hour = onlyValues(parsed, 'hour') ? list(hours.map(h => valueText(FIELDS[1], h))) : fieldText(parsed, 'hour')
  return glue(hour, phrase('of'), minute)
}

// Weekdays as a list when steps make the tokens hard to read ("*/2" → Sunday, Tuesday…)
function weekdayText(parsed) {
  if (tokensAre(parsed, 'dow', isSimple)) {
    return fieldText(parsed, 'dow')
  }
  return list(sortedValues(parsed, 'dow').map(v => valueName(FIELDS[4], v)))
}

// { text, compound }: compound when it names both days of the month and weekdays
function chineseDays(parsed, inMonths) {
  const { dom, dow } = parsed.fields
  const domFull = isFull(parsed, 'dom')
  const dowFull = isFull(parsed, 'dow')
  const days = glue(inMonths ? '' : phrase('monthly'), fieldText(parsed, 'dom'))
  if (domFull && dowFull) {
    return { text: '', compound: false }
  }
  if (dom.star || dow.star) {
    if (!domFull && !dowFull) {
      return { text: phrase('domAndDow', { days, weekdays: weekdayText(parsed) }), compound: true }
    }
    return { text: domFull ? phrase('everyWeekday', { weekdays: weekdayText(parsed) }) : days, compound: false }
  }
  return { text: phrase('domOrDow', { days, weekdays: weekdayText(parsed) }), compound: true }
}

function describeChinese(parsed) {
  const months = isFull(parsed, 'month') ? '' : glue(phrase('yearly'), fieldText(parsed, 'month'))
  const days = chineseDays(parsed, Boolean(months))
  const time = chineseTime(parsed)
  const everyHour = tokensAre(parsed, 'hour', token => token.type === 'all')
  let when
  // `open` when it ends in a comma, which wants no space after it
  let open = false
  if (months && days.text) {
    when = isFull(parsed, 'dow') && !days.compound ? glue(months, days.text) : glue(months, phrase('of'), days.text)
  } else if (months) {
    when = phrase(everyHour ? 'monthOnly' : 'monthDaily', { months })
    open = everyHour
  } else {
    when = days.text || (everyHour ? '' : phrase('daily'))
  }
  return glue(when, when && !open && !/^\d/.test(time) ? ' ' : '', time, phrase('run')).replace(/\s+/g, ' ')
}

const capitalise = text => text.charAt(0).toUpperCase() + text.slice(1)

// "Every minute", "Every 5 minutes", or what the field says "… of every hour"
function englishMinutes(parsed) {
  const { tokens } = parsed.fields.minute
  if (isFull(parsed, 'minute')) {
    return phrase('everyMinute')
  }
  if (tokens.length === 1 && tokens[0].type === 'all') {
    return phrase('everyMinutes', { n: tokens[0].step })
  }
  return phrase('ofEveryHour', { minutes: capitalise(fieldText(parsed, 'minute')) })
}

// { text, fixed }: fixed when it is a list of clock times ("At 09:00 and 17:00")
function englishTime(parsed) {
  const minutes = sortedValues(parsed, 'minute')
  const hours = sortedValues(parsed, 'hour')
  const exact = onlyValues(parsed, 'minute')
  const everyHour = isFull(parsed, 'hour')
  if (exact && onlyValues(parsed, 'hour') && (minutes.length === 1 || minutes.length * hours.length <= 8)) {
    return { text: phrase('at', { times: list(clockTimes(hours, minutes)) }), fixed: true }
  }
  if (exact && everyHour && minutes.length === 1 && minutes[0] === 0) {
    return { text: phrase('hourly'), fixed: false }
  }
  if (!exact && everyHour) {
    return { text: englishMinutes(parsed), fixed: false }
  }
  const past = key => tc(`tools.cron.phrases.${key}`, minutes.length === 1 && minutes[0] === 1 ? 1 : 2, { minutes: list(minutes) })
  if (everyHour) {
    return { text: past('pastEveryHour'), fixed: false }
  }
  const { tokens } = parsed.fields.hour
  if (exact && minutes.length === 1) {
    // One minute of several hours: "At 08:30 and every 2 hours from 12:30 through 18:30"
    const at = h => `${pad(h)}:${pad(minutes[0])}`
    const parts = tokens.map(token => {
      const last = token.from + Math.floor((token.to - token.from) / token.step) * token.step
      if (last === token.from) {
        return at(last)
      }
      return phrase(token.step === 1 ? 'everyHour' : 'everyHours', { n: token.step, from: at(token.from), to: at(last) })
    })
    const text = list(parts)
    return { text: /^\d/.test(text) ? phrase('at', { times: text }) : capitalise(text), fixed: false }
  }
  // Several minutes of some hours: "Every 15 minutes from 09:00 through 17:59"
  const within = tokens.length <= 2 && tokens.every(isSimple)
    ? list(tokens.map(token => phrase('window', { from: `${pad(token.from)}:00`, to: `${pad(token.to)}:59` })))
    : tc('tools.cron.phrases.duringHours', hours.length, { hours: list(hours) })
  return { text: `${exact ? past('pastTheHour') : englishMinutes(parsed)} ${within}`, fixed: false }
}

// "on the 1st and 15th", "on the 1st through the 7th", "every 2 days from the 1st"
function englishMonthDays(parsed) {
  if (onlyValues(parsed, 'dom')) {
    const days = sortedValues(parsed, 'dom').map(ordinal)
    return phrase('on', { days: phrase('theDays', { days: list(days) }) })
  }
  const text = fieldText(parsed, 'dom')
  return isSimple(parsed.fields.dom.tokens[0]) ? phrase('on', { days: text }) : text
}

function englishWeekdays(parsed) {
  const values = sortedValues(parsed, 'dow').join()
  if (values === '1,2,3,4,5') {
    return phrase('weekdays')
  }
  return values === '0,6' ? phrase('weekends') : weekdayText(parsed)
}

function englishMonths(parsed) {
  if (tokensAre(parsed, 'month', isSimple)) {
    return fieldText(parsed, 'month')
  }
  return list(sortedValues(parsed, 'month').map(v => valueName(FIELDS[3], v)))
}

function englishDays(parsed, fixed) {
  const { dom, dow } = parsed.fields
  const months = isFull(parsed, 'month') ? '' : englishMonths(parsed)
  const domFull = isFull(parsed, 'dom')
  const dowFull = isFull(parsed, 'dow')
  // Neither field starts with "*": a day matching either one will do
  const either = !dom.star && !dow.star
  if ((domFull && dowFull) || (either && (domFull || dowFull))) {
    // Fixed times read "… every day"; "Every 5 minutes" needs nothing more
    const days = fixed ? phrase('everyDay') : ''
    return months && days ? phrase('inMonths', { days, months }) : months ? phrase('in', { months }) : days
  }
  const weekdays = englishWeekdays(parsed)
  if (domFull) {
    const days = phrase('on', { days: weekdays })
    return months ? phrase('inMonths', { days, months }) : days
  }
  const days = englishMonthDays(parsed)
  const inMonth = months ? phrase('ofMonths', { days, months }) : phrase('ofEveryMonth', { days })
  if (dowFull) {
    return inMonth
  }
  if (either) {
    return months ? phrase('orOnIn', { days, weekdays, months }) : phrase('orOn', { days: inMonth, weekdays })
  }
  return phrase('butOnlyOn', { days: inMonth, weekdays })
}

function describeEnglish(parsed) {
  const time = englishTime(parsed)
  const days = englishDays(parsed, time.fixed)
  return days ? phrase(time.fixed ? 'fixed' : 'loose', { time: time.text, days }) : time.text
}

const DESCRIBERS = { 'zh-CN': describeChinese, en: describeEnglish }

export function describeCron(parsed) {
  return (DESCRIBERS[currentLocale()] || describeChinese)(parsed)
}

// What each field allows, for the breakdown table
export function fieldSummary(parsed) {
  return FIELDS.map(field => {
    const values = sortedValues(parsed, field.key)
    const full = isFull(parsed, field.key)
    let allowed
    if (full) {
      allowed = message('all')
    } else if (field.key === 'dow') {
      allowed = values.map(v => weekdayName(v, 'short')).join(message('list.separator'))
    } else {
      allowed = values.join(', ')
    }
    return { key: field.key, label: fieldLabel(field), raw: parsed.fields[field.key].raw, text: fieldText(parsed, field.key), list: allowed }
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
  // 28 years covers every combination of date and weekday (e.g. 29 February on a Monday)
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
