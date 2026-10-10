// 法定节假日: tools.holidays.*
export default {
  summary: '{year} 年共 {rest} 天假期（含周末），调休上班 {work} 天，全年法定工作日 {workdays} 天。',
  holiday: '节日',
  daysOff: '放假时间',
  length: '天数',
  makeUp: '调休上班',
  day: '{date}（{week}）',
  range: '{from} 至 {to}',
  uncovered: 'lunar-javascript {version} 中没有 {year} 年的放假安排，因此这里不显示任何日期，以免误导。现有数据覆盖 {first}–{last} 年；国务院办公厅通常在前一年的 11–12 月公布下一年的安排，届时更新依赖即可。',
  source: '数据来自 lunar-javascript 内置的国务院办公厅节假日安排。'
}
