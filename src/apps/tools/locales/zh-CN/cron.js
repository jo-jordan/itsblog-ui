// Cron 表达式: tools.cron.*
export default {
  expression: '表达式：',
  placeholder: '分 时 日 月 周',
  presetsLabel: '常用：',
  choosePreset: '选择一个示例…',
  presetOption: '{label}（{value}）',
  presets: {
    everyMinute: '每分钟',
    every5Minutes: '每 5 分钟',
    hourly: '每小时整点',
    daily: '每天 9 点',
    weekdays: '工作日 9 点',
    workHours: '工作时间每 15 分钟',
    weekly: '每周一 10 点',
    monthly: '每月 1 日凌晨',
    domOrDow: '每月 1、15 日或周五',
    quarterly: '每季度首日',
    yearly: '每年'
  },
  timeZone: '时区：',
  meaning: '含义',
  orHint: '“日”和“星期”都有限定时，按 Vixie cron 的规则两者满足其一即执行；只要其中一个以 * 开头，则两者都要满足。',
  fieldsTitle: '各字段',
  columns: {
    field: '字段',
    raw: '写法',
    meaning: '含义',
    values: '取值'
  },
  nextRuns: '接下来 {n} 次执行（{zone}）',
  zoneLabel: '{city}，{offset}',
  noRuns: '在未来 28 年内找不到匹配的时间（例如 2 月 30 日）。',
  help: {
    title: '语法说明',
    fields: '五个字段依次是：分钟（0–59）、小时（0–23）、日（1–31）、月（1–12 或 JAN–DEC）、星期（0–7 或 SUN–SAT，0 和 7 都是周日）。',
    syntax: '{any} 任意值；{list} 列表；{range} 范围；{step} 或 {stepRange} 步长；{short} 等同 {long}。',
    macros: '支持简写 {yearly} {monthly} {weekly} {daily} {hourly}。',
    dst: '夏令时开始时被跳过的时刻不会执行。'
  },

  // lib/cron.js: what one field allows. {v}, {from}, {to} are numbers; {name},
  // {fromName}, {toName} the month, weekday or ordinal they stand for.
  all: '全部',
  list: {
    separator: '、',
    last: '、'
  },
  months: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'],
  weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  ordinals: {
    one: '{n}',
    two: '{n}',
    few: '{n}',
    other: '{n}'
  },
  fields: {
    minute: {
      label: '分钟',
      every: '每分钟',
      step: '每隔 {n} 分钟',
      value: '{v} 分',
      range: '{from} 分至 {to} 分',
      rangeStep: '{range}之间每隔 {n} 分钟'
    },
    hour: {
      label: '小时',
      every: '每小时',
      step: '每隔 {n} 小时',
      value: '{v} 点',
      range: '{from} 点至 {to} 点',
      rangeStep: '{range}之间每隔 {n} 小时'
    },
    dom: {
      label: '日',
      every: '每天',
      step: '从 1 日起每隔 {n} 天',
      value: '{v} 日',
      range: '{from} 日至 {to} 日',
      rangeStep: '{range}之间每隔 {n} 天'
    },
    month: {
      label: '月',
      every: '每个月',
      step: '每隔 {n} 个月',
      value: '{name}',
      range: '{fromName}至 {toName}',
      rangeStep: '{range}之间每隔 {n} 个月'
    },
    dow: {
      label: '星期',
      every: '每天',
      step: '每隔 {n} 天',
      value: '{name}',
      range: '{fromName}至{toName}',
      rangeStep: '{range}之间每隔 {n} 天'
    }
  },
  errors: {
    empty: '请输入 cron 表达式',
    reboot: '{macro} 只在系统启动时执行一次，无法推算时间',
    unknownMacro: '不认识的简写“{text}”',
    fieldCount: '标准 cron 表达式需要 5 个字段（分 时 日 月 周），这里有 {n} 个',
    missing: '缺少{field}字段',
    extraComma: '{field}字段中有多余的逗号',
    manySlashes: '{field}字段中的“{text}”有多个“/”',
    badStep: '{field}字段中的步长“{text}”必须是正整数',
    badRange: '{field}字段中的范围“{text}”无效',
    reversedRange: '{field}字段中的范围“{text}”起点大于终点',
    notNumber: '{field}字段中的“{text}”不是有效的数字',
    notNumberOrName: '{field}字段中的“{text}”不是有效的数字或名称',
    outOfRange: '{field}字段的取值范围是 {min}–{max}，“{text}”超出范围'
  },

  // The sentence itself is composed per language (describeChinese in lib/cron.js),
  // so these keys differ from the English ones.
  phrases: {
    everyMinute: '每分钟',
    onTheHour: '整点',
    atMinutes: '第 {minutes} 分',
    ofEveryHour: '每小时的',
    of: '的',
    yearly: '每年',
    monthly: '每月',
    daily: '每天',
    everyWeekday: '每{weekdays}',
    domAndDow: '{days}，且逢{weekdays}',
    domOrDow: '{days}，或每{weekdays}',
    monthOnly: '{months}，',
    monthDaily: '{months}，每天',
    run: '执行'
  }
}
