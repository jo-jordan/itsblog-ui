// Duration: tools.duration.*
export default {
  fromSeconds: 'Seconds → Days / Hours / Minutes / Seconds',
  secondsLabel: 'Seconds:',
  duration: 'Duration',
  clock: 'h:mm:ss',
  totals: 'In total',
  totalsText: '{minutes} min · {hours} hr · {days} d',
  enterSeconds: 'Enter a number of seconds (decimals are fine).',
  toSeconds: 'Days / Hours / Minutes / Seconds → Seconds',
  units: {
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds'
  },
  total: 'Total',
  seconds: '{n} second | {n} seconds',
  paren: '({text})',
  enterNumbers: 'Enter numbers',
  sum: 'Add & Subtract',
  expression: 'Expression:',
  expressionExample: 'e.g. 1:45:30 + 2:20 - 15m',
  formats: 'Accepts 1:45:30 (h:mm:ss), 2:20 (h:mm), 1d 2h 30m, 1h 30m 45s and the like; a bare number is seconds.',
  result: 'Result',
  equals: 'Equals',
  clockMath: 'Time ± Duration',
  time: 'Time',
  sign: 'Add or subtract',
  durationExample: 'e.g. 2:45',
  sameDay: '(same day)',
  nextDay: '(next day)',
  previousDay: '(previous day)',
  daysLater: '({n} days later)',
  daysEarlier: '({n} days earlier)',
  enterBoth: 'Enter a time and a duration.',
  // lib/duration.js
  parts: {
    days: '{n} day | {n} days',
    hours: '{n} hour | {n} hours',
    minutes: '{n} minute | {n} minutes',
    seconds: '{n} second | {n} seconds',
    separator: ', '
  },
  errors: {
    empty: 'Enter a duration',
    unreadable: 'Can’t read “{term}”'
  }
}
