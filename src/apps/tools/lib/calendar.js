// Everything Chinese-calendar related goes through lunar-javascript (6tail).
// It is big, so only the toolbox chunk imports this file.
import { Solar, Lunar, LunarYear, HolidayUtil } from 'lunar-javascript'
import { countWeekdays, dayNumber, formatYmd, fromDayNumber, isWeekend, today } from './dates'
import { t, tc, tm } from './i18n'

// The library is always left in Chinese: its own I18n.setLanguage() is global,
// only partly translated, and changes the very strings this file and the tools
// compare against. English names come from tools.calendar.* lookup maps instead.

export { Solar, Lunar }

// Years offered by the lunar pickers
export const MIN_YEAR = 1900
export const MAX_YEAR = 2100

export function solarOf(date) {
  return Solar.fromYmd(date.y, date.m, date.d)
}

export function lunarOf(date) {
  return solarOf(date).getLunar()
}

export function dateOfSolar(solar) {
  return { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay() }
}

// ---- Names in the current language ------------------------------------------------

// A name the library gives in Chinese, looked up in a tools.calendar.<map> table;
// anything the table lacks (and everything in Chinese) stays as it is
function translated(map, name) {
  const names = tm(`tools.calendar.${map}`)
  return (names && typeof names === 'object' && names[name]) || name
}

// 立春 / Start of Spring
export const termName = name => translated('terms', name)
// 马 / Horse
export const zodiacName = name => translated('zodiacs', name)
// 天秤 / Libra
export const signName = name => translated('signs', name)
// 国庆节 / National Day (official public holidays)
export const holidayName = name => translated('holidays', name)
// 中秋节 / Mid-Autumn Festival; festivals without a usual English name stay Chinese
export const festivalName = name => translated('festivals', name)
// 东南 / Southeast, 正北 / North
export const directionName = name => translated('directions', name)

// 国庆节放假 / National Day holiday, 国庆节调休上班 / National Day make-up workday
export function holidayStatus(holiday) {
  return t(holiday.work ? 'tools.calendar.holidayWork' : 'tools.calendar.holidayRest', { name: holidayName(holiday.name) })
}

// 休 / Off, 班 / Work
export function holidayBadge(holiday) {
  return t(holiday.work ? 'tools.calendar.badgeWork' : 'tools.calendar.badgeRest')
}

// '3 天后' / 'in 3 days', '3 天前' / '3 days ago'; zero is left to the caller
export function daysAway(days) {
  return days > 0 ? tc('tools.calendar.daysLater', days) : tc('tools.calendar.daysAgo', -days)
}

// Lunar month by number, negative for a leap month: '六月' / '闰六月', '6th month' / 'Leap 6th month'
export function lunarMonthLabel(month) {
  const name = tm('tools.calendar.monthNames')[Math.abs(month) - 1]
  return month < 0 ? t('tools.calendar.leapMonth', { month: name }) : name
}

// Lunar day by number: '十五' / 'Day 15'
export function lunarDayName(day) {
  return tm('tools.calendar.dayNames')[day - 1]
}

// Lunar month and day by number: '八月十五' / '8th month, day 15'
export function lunarMonthDayText(month, day) {
  return t('tools.calendar.monthDay', { month: lunarMonthLabel(month), day: lunarDayName(day), d: day })
}

// '闰六月' / '正月', 'Leap 6th month' / '1st month'
export function lunarMonthName(lunar) {
  return lunarMonthLabel(lunar.getMonth())
}

// '八月十五' / '8th month, day 15'; with the year '丙午年 八月十五' / '丙午 year, 8th month, day 15'
export function lunarText(lunar, withYear = false) {
  const text = lunarMonthDayText(lunar.getMonth(), lunar.getDay())
  return withYear ? t('tools.calendar.withYear', { year: lunar.getYearInGanZhi(), text }) : text
}

// lunarText() that says it is lunar: '农历八月十五' / 'Lunar 8th month, day 15'
export function lunarDateText(lunar, withYear = false) {
  return t('tools.calendar.prefixed', { text: lunarText(lunar, withYear) })
}

// The six solar terms getJieQiTable() keys in pinyin (the ones belonging to the neighbouring years)
const TERM_NAMES = {
  DA_XUE: '大雪',
  DONG_ZHI: '冬至',
  XIAO_HAN: '小寒',
  DA_HAN: '大寒',
  LI_CHUN: '立春',
  YU_SHUI: '雨水',
  JING_ZHE: '惊蛰'
}

// The twelve 节 (the terms that begin a 干支 month); the other twelve are 中气
const JIE = ['小寒', '立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪']

// 吉, as the library spells a lucky 值神 / 星宿
const LUCKY = '吉'

export const isLucky = luck => luck === LUCKY

// The 24 solar terms falling in a Gregorian year, in order, with their exact
// moment (Beijing time, as computed by the library). `name` stays Chinese (it
// is what the library compares); show it through termName().
export function solarTermsOf(year) {
  const found = {}
  ;[1, 7, 12].forEach(month => {
    const table = Solar.fromYmd(year, month, 1).getLunar().getJieQiTable()
    Object.keys(table).forEach(key => {
      const solar = table[key]
      if (solar.getYear() === year) {
        const name = TERM_NAMES[key] || key
        found[solar.toYmdHms()] = { name, solar, jie: JIE.includes(name) }
      }
    })
  })
  return Object.keys(found).sort().map(key => found[key])
}

// Moment of a library Solar (Beijing time) as epoch milliseconds
export function beijingEpoch(solar) {
  return Date.UTC(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond()) - 8 * 3600000
}

// ---- Lunar ↔ Gregorian ----------------------------------------------------------

// Months of a lunar year: [{ value: 6, label: '六月', days: 30 }, { value: -6, label: '闰六月', days: 29 }, …]
// (labels in the current language)
export function lunarMonthsOf(year) {
  return LunarYear.fromYear(year).getMonthsInYear().map(month => {
    const value = month.getMonth()
    return { value, label: lunarMonthLabel(value), days: month.getDayCount(), leap: value < 0 }
  })
}

export function leapMonthOf(year) {
  return LunarYear.fromYear(year).getLeapMonth()
}

// Validated lunar → Gregorian; month is negative for a leap month. Returns null when the date does not exist.
export function lunarToSolar(year, month, day) {
  const info = lunarMonthsOf(year).find(item => item.value === month)
  if (!info || day < 1 || day > info.days) {
    return null
  }
  return dateOfSolar(Lunar.fromYmd(year, month, day).getSolar())
}

// The Gregorian date on which lunar month/day falls in a given lunar year.
// A leap month that the year lacks falls back to the ordinary month, and day 30
// of a 29-day month falls on day 29, as people usually celebrate it.
export function lunarAnniversaryIn(year, month, day) {
  const months = lunarMonthsOf(year)
  const info = months.find(item => item.value === month) || months.find(item => item.value === Math.abs(month))
  return dateOfSolar(Lunar.fromYmd(year, info.value, Math.min(day, info.days)).getSolar())
}

// Next occurrence (on or after `from`) of a lunar month/day
export function nextLunarAnniversary(month, day, from = today()) {
  const start = lunarOf(from).getYear()
  for (let year = start - 1; year <= start + 2; year++) {
    if (year < MIN_YEAR - 1 || year > MAX_YEAR + 1) {
      continue
    }
    const date = lunarAnniversaryIn(year, month, day)
    if (dayNumber(date) >= dayNumber(from)) {
      return date
    }
  }
  return null
}

// ---- Official public holidays (国务院办公厅 arrangement) ---------------------------

const holidayCache = {}

// { 'YYYY-MM-DD': { name, work, target } } for every arranged day in that year;
// `name` is the library's Chinese name, shown through holidayName()
export function holidayMap(year) {
  if (!holidayCache[year]) {
    const map = {}
    if (year >= 1990 && year <= 2200) {
      HolidayUtil.getHolidays(year).forEach(holiday => {
        map[holiday.getDay()] = { day: holiday.getDay(), name: holiday.getName(), work: holiday.isWork(), target: holiday.getTarget() }
      })
    }
    holidayCache[year] = map
  }
  return holidayCache[year]
}

export function holidayOf(date) {
  return holidayMap(date.y)[formatYmd(date)] || null
}

// A year counts as covered when the library has its own arrangement (not only
// the next New Year's Day spilling into late December)
export function hasHolidayData(year) {
  const prefix = String(year)
  return Object.values(holidayMap(year)).some(holiday => holiday.target.slice(0, 4) === prefix)
}

let coveredYears = null

// [first, last] years with holiday data
export function holidayDataRange() {
  if (!coveredYears) {
    const years = []
    for (let year = 1990; year <= 2200; year++) {
      if (hasHolidayData(year)) {
        years.push(year)
      }
    }
    coveredYears = years.length ? [years[0], years[years.length - 1]] : [0, -1]
  }
  return coveredYears
}

export function isOfficialWorkday(date) {
  const holiday = holidayOf(date)
  return holiday ? holiday.work : !isWeekend(date)
}

// Years within [a, b] the holiday data does not cover
export function uncoveredYears(a, b) {
  const [first, last] = holidayDataRange()
  const years = []
  for (let year = a.y; year <= b.y; year++) {
    if (year < first || year > last) {
      years.push(year)
    }
  }
  return years
}

// Workdays between a and b inclusive (a ≤ b), following the official arrangement
export function countOfficialWorkdays(a, b) {
  let count = countWeekdays(a, b)
  const start = dayNumber(a)
  const end = dayNumber(b)
  const [first, last] = holidayDataRange()
  for (let year = Math.max(a.y, first - 1); year <= Math.min(b.y, last + 1); year++) {
    Object.values(holidayMap(year)).forEach(holiday => {
      const [y, m, d] = holiday.day.split('-').map(Number)
      const date = { y, m, d }
      const n = dayNumber(date)
      if (n < start || n > end) {
        return
      }
      if (holiday.work && isWeekend(date)) {
        count++
      } else if (!holiday.work && !isWeekend(date)) {
        count--
      }
    })
  }
  return count
}

// Move n working days from a date (the date itself is not counted)
export function shiftWorkdays(date, n, official) {
  const step = n < 0 ? -1 : 1
  let left = Math.abs(n)
  let current = dayNumber(date)
  while (left > 0) {
    current += step
    const day = fromDayNumber(current)
    if (official ? isOfficialWorkday(day) : !isWeekend(day)) {
      left--
    }
  }
  return fromDayNumber(current)
}

// ---- Festivals shown on calendar cells ------------------------------------------

export function festivalsOf(date) {
  const solar = solarOf(date)
  const lunar = solar.getLunar()
  return {
    lunar: lunar.getFestivals(),
    lunarOther: lunar.getOtherFestivals(),
    solar: solar.getFestivals(),
    solarOther: solar.getOtherFestivals()
  }
}

// Text under the day number in a month grid: festival › solar term › lunar day,
// in the current language
export function cellInfo(date) {
  const solar = solarOf(date)
  const lunar = solar.getLunar()
  const festival = lunar.getFestivals()[0] || solar.getFestivals()[0]
  const term = lunar.getJieQi()
  let label
  let kind = 'lunar'
  if (festival) {
    label = festivalName(festival)
    kind = 'festival'
  } else if (term) {
    label = termName(term)
    kind = 'term'
  } else {
    label = lunar.getDay() === 1 ? lunarMonthName(lunar) : tm('tools.calendar.cellDays')[lunar.getDay() - 1]
    kind = lunar.getDay() === 1 ? 'month' : 'lunar'
  }
  return { label, kind, lunar, holiday: holidayOf(date) }
}
