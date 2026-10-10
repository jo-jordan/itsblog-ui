// 日期推算: tools.dateShift.*
export default {
  base: '起始日期：',
  shift: '推算：',
  direction: '加或减',
  forward: '往后 +',
  back: '往前 −',
  amount: '数量',
  unit: '单位',
  // Unit pop-up, read after the amount field
  units: {
    day: '天',
    week: '周',
    month: '个月',
    year: '年',
    workday: '个工作日（周一至周五）',
    official: '个工作日（法定节假日）'
  },
  // Amounts in the table, through tc(key, n)
  amounts: {
    day: '{n} 天',
    week: '{n} 周',
    month: '{n} 个月',
    year: '{n} 年',
    workday: '{n} 个工作日',
    official: '{n} 个法定工作日'
  },
  result: '结果',
  allForward: '往后 {n} 个单位的全部结果',
  allBack: '往前 {n} 个单位的全部结果',
  date: '日期',
  weekday: '星期',
  outOfRange: '超出范围',
  beyondRange: '超出可计算范围',
  invalidBase: '请输入有效的起始日期。',
  invalidAmount: '数量请填写 0 到 100000 之间的整数。',
  noDataList: '{years} 年没有法定放假数据，按周一至周五推算。',
  noDataRange: '{from}–{to} 年中的部分年份没有法定放假数据，按周一至周五推算。',
  listSeparator: '、',
  clamped: '目标月份没有 {d} 日，已取当月最后一天。'
}
