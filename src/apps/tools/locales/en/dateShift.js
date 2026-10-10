// Add or Subtract: tools.dateShift.*
export default {
  base: 'Start date:',
  shift: 'Move:',
  direction: 'Add or subtract',
  forward: 'Forward +',
  back: 'Back −',
  amount: 'Amount',
  unit: 'Unit',
  // Unit pop-up, read after the amount field
  units: {
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years',
    workday: 'weekdays (Mon–Fri)',
    official: 'working days (Chinese holidays)'
  },
  // Amounts in the table, through tc(key, n)
  amounts: {
    day: '{n} day | {n} days',
    week: '{n} week | {n} weeks',
    month: '{n} month | {n} months',
    year: '{n} year | {n} years',
    workday: '{n} weekday | {n} weekdays',
    official: '{n} working day | {n} working days'
  },
  result: 'Result',
  allForward: 'Forward by {n} of Each Unit',
  allBack: 'Back by {n} of Each Unit',
  date: 'Date',
  weekday: 'Weekday',
  outOfRange: 'Out of range',
  beyondRange: 'Out of range',
  invalidBase: 'Enter a valid start date.',
  invalidAmount: 'Enter a whole number from 0 to 100000.',
  noDataList: 'No public holiday data for {years}; counted Monday–Friday.',
  noDataRange: 'No public holiday data for some of the years {from}–{to}; counted Monday–Friday.',
  listSeparator: ', ',
  clamped: 'The target month has no day {d}; its last day is used.'
}
