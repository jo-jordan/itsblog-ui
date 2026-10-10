// 月历: tools.monthCalendar.*
export default {
  previousMonth: '上个月',
  nextMonth: '下个月',
  year: '年份',
  month: '月份',
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  weekStart: '每周第一天',
  mondayFirst: '周一开始',
  sundayFirst: '周日开始',
  // weekdayName() style of the column headers
  headerStyle: 'narrow',
  caption: '{date} · 农历{lunar}',
  captionYear: '{year}年{text}',
  uncovered: 'lunar-javascript 尚未收录 {year} 年的法定放假安排（现有数据覆盖 {first}–{last} 年），本月不显示休/班标记。',
  ariaSeparator: ' ',
  hint: '点击任意一天即可查看当天的黄历。',
  events: '本月节气与假日',
  termEvent: '{name} {time} 交节',
  restEvent: '{name}放假（{n} 天在本月）',
  dayRange: '{from}–{to}日'
}
