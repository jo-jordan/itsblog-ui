// 月历 (the month calendar): tools.monthCalendar.*
export default {
  previousMonth: 'Previous Month',
  nextMonth: 'Next Month',
  year: 'Year',
  month: 'Month',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekStart: 'First day of the week',
  mondayFirst: 'Monday First',
  sundayFirst: 'Sunday First',
  // weekdayName() style of the column headers
  headerStyle: 'short',
  caption: '{date} · Lunar {lunar}',
  captionYear: '{year} year, {text}',
  uncovered: 'lunar-javascript has no official holiday schedule for {year} yet (its data covers {first}–{last}), so this month shows no Off/Work badges.',
  ariaSeparator: ', ',
  hint: 'Click a day to open its almanac.',
  events: 'Solar Terms and Holidays This Month',
  termEvent: '{name} begins at {time}',
  restEvent: '{name} holiday ({n} day this month) | {name} holiday ({n} days this month)',
  dayRange: '{from}–{to}'
}
