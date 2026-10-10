// Chinese-calendar wording shared by lib/calendar.js and the 日历 tools: tools.calendar.*
const DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

export default {
  prefixed: '农历{text}',
  monthNames: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'],
  leapMonth: '闰{month}',
  // In the pickers and in running text
  dayNames: DAYS,
  // Under the day number of a calendar cell
  cellDays: DAYS,
  monthDay: '{month}{day}',
  withYear: '{year}年 {text}',
  // Accessible names of the lunar date picker; label says whose date it is
  pickerYear: '{label}农历年',
  pickerMonth: '{label}农历月',
  pickerDay: '{label}农历日',
  yearOption: '{y}年',
  previousYear: '上一年',
  nextYear: '下一年',
  yearLabel: '年份：',
  thisYear: '今年',
  daysLater: '{n} 天后',
  daysAgo: '{n} 天前',
  holidayRest: '{name}放假',
  holidayWork: '{name}调休上班',
  badgeRest: '休',
  badgeWork: '班',
  listSeparator: '、',
  none: '无',
  ganzhi: '干支',
  zodiac: '生肖',
  weekday: '星期',
  fromToday: '距今',
  // The library's names are already Chinese; the English file maps them
  terms: {},
  zodiacs: {},
  signs: {},
  holidays: {},
  festivals: {},
  directions: {}
}
