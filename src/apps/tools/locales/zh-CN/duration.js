// 时长换算: tools.duration.*
export default {
  fromSeconds: '秒数 → 天 / 时 / 分 / 秒',
  secondsLabel: '秒数：',
  duration: '时长',
  clock: '时:分:秒',
  totals: '合计',
  totalsText: '{minutes} 分钟 · {hours} 小时 · {days} 天',
  enterSeconds: '请输入秒数（可以有小数）。',
  toSeconds: '天 / 时 / 分 / 秒 → 秒数',
  units: {
    days: '天',
    hours: '小时',
    minutes: '分',
    seconds: '秒'
  },
  total: '共',
  seconds: '{n} 秒',
  paren: '（{text}）',
  enterNumbers: '请填写数字',
  sum: '时长加减',
  expression: '算式：',
  expressionExample: '例如 1:45:30 + 2:20 - 15m',
  formats: '支持 1:45:30（时:分:秒）、2:20（时:分）、1天2小时30分、1h 30m 45s 等写法，纯数字按秒计。',
  result: '结果',
  equals: '即',
  clockMath: '时刻 ± 时长',
  time: '时刻',
  sign: '加或减',
  durationExample: '例如 2:45',
  sameDay: '（当天）',
  nextDay: '（次日）',
  previousDay: '（前一天）',
  daysLater: '（{n} 天后）',
  daysEarlier: '（{n} 天前）',
  enterBoth: '请输入时刻和时长。',
  // lib/duration.js
  parts: {
    days: '{n} 天',
    hours: '{n} 小时',
    minutes: '{n} 分',
    seconds: '{n} 秒',
    separator: ' '
  },
  errors: {
    empty: '请输入时长',
    unreadable: '看不懂“{term}”'
  }
}
