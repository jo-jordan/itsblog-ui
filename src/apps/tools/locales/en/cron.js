// Cron: tools.cron.*
export default {
  expression: 'Expression:',
  placeholder: 'minute hour day month weekday',
  presetsLabel: 'Examples:',
  choosePreset: 'Choose an example…',
  presetOption: '{label} ({value})',
  presets: {
    everyMinute: 'Every minute',
    every5Minutes: 'Every 5 minutes',
    hourly: 'Every hour, on the hour',
    daily: 'Every day at 9:00',
    weekdays: 'Weekdays at 9:00',
    workHours: 'Every 15 minutes in working hours',
    weekly: 'Mondays at 10:00',
    monthly: 'Midnight on the 1st of the month',
    domOrDow: 'The 1st, the 15th, or any Friday',
    quarterly: 'First day of each quarter',
    yearly: 'Once a year'
  },
  timeZone: 'Time zone:',
  meaning: 'Meaning',
  orHint: 'When both the day and the weekday are restricted, Vixie cron runs the job when either one matches; if either field starts with *, both must match.',
  fieldsTitle: 'Fields',
  columns: {
    field: 'Field',
    raw: 'Entry',
    meaning: 'Meaning',
    values: 'Values'
  },
  nextRuns: 'Next run ({zone}) | Next {n} runs ({zone})',
  zoneLabel: '{city}, {offset}',
  noRuns: 'No matching time in the next 28 years (February 30, for example).',
  help: {
    title: 'Syntax',
    fields: 'The five fields are, in order: minute (0–59), hour (0–23), day of the month (1–31), month (1–12 or JAN–DEC) and weekday (0–7 or SUN–SAT; 0 and 7 are both Sunday).',
    syntax: '{any} any value; {list} a list; {range} a range; {step} or {stepRange} steps; {short} is the same as {long}.',
    macros: 'Shortcuts: {yearly} {monthly} {weekly} {daily} {hourly}.',
    dst: 'Times skipped when daylight saving time begins do not run.'
  },

  // lib/cron.js: what one field allows. {v}, {from}, {to} are numbers; {name},
  // {fromName}, {toName} the month, weekday or ordinal they stand for.
  all: 'All',
  list: {
    separator: ', ',
    last: ' and '
  },
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ordinals: {
    one: '{n}st',
    two: '{n}nd',
    few: '{n}rd',
    other: '{n}th'
  },
  fields: {
    minute: {
      label: 'Minute',
      every: 'every minute',
      step: 'every {n} minutes',
      value: 'minute {v}',
      range: 'minutes {from} through {to}',
      rangeStep: 'every {n} minutes from {from} through {to}'
    },
    hour: {
      label: 'Hour',
      every: 'every hour',
      step: 'every {n} hours',
      value: 'hour {v}',
      range: 'hours {from} through {to}',
      rangeStep: 'every {n} hours from {from} through {to}'
    },
    dom: {
      label: 'Day',
      every: 'every day',
      step: 'every {n} days from the 1st',
      value: 'the {name}',
      range: 'the {fromName} through the {toName}',
      rangeStep: 'every {n} days from the {fromName} through the {toName}'
    },
    month: {
      label: 'Month',
      every: 'every month',
      step: 'every {n} months',
      value: '{name}',
      range: '{fromName} through {toName}',
      rangeStep: 'every {n} months from {fromName} through {toName}'
    },
    dow: {
      label: 'Weekday',
      every: 'every day',
      step: 'every {n} days of the week',
      value: '{name}',
      range: '{fromName} through {toName}',
      rangeStep: 'every {n} days from {fromName} through {toName}'
    }
  },
  errors: {
    empty: 'Enter a cron expression',
    reboot: '{macro} runs once when the system starts, so its times can’t be predicted',
    unknownMacro: 'Unknown shortcut “{text}”',
    fieldCount: 'A standard cron expression has 5 fields (minute hour day month weekday); this one has {n}',
    missing: 'The {field} field is missing',
    extraComma: '{field}: stray comma',
    manySlashes: '{field}: “{text}” has more than one “/”',
    badStep: '{field}: the step “{text}” must be a positive whole number',
    badRange: '{field}: “{text}” is not a valid range',
    reversedRange: '{field}: the range “{text}” starts after it ends',
    notNumber: '{field}: “{text}” is not a valid number',
    notNumberOrName: '{field}: “{text}” is not a valid number or name',
    outOfRange: '{field}: “{text}” is out of range ({min}–{max})'
  },

  // The sentence itself is composed per language (describeEnglish in lib/cron.js),
  // so these keys differ from the Chinese ones.
  phrases: {
    at: 'At {times}',
    everyMinute: 'Every minute',
    everyMinutes: 'Every {n} minutes',
    hourly: 'Every hour on the hour',
    pastEveryHour: 'At {minutes} minute past every hour | At {minutes} minutes past every hour',
    pastTheHour: 'At {minutes} minute past the hour | At {minutes} minutes past the hour',
    ofEveryHour: '{minutes} of every hour',
    everyHour: 'every hour from {from} through {to}',
    everyHours: 'every {n} hours from {from} through {to}',
    window: 'from {from} through {to}',
    duringHours: 'during hour {hours} | during hours {hours}',
    theDays: 'the {days}',
    on: 'on {days}',
    weekdays: 'weekdays',
    weekends: 'weekends',
    everyDay: 'every day',
    ofEveryMonth: '{days} of every month',
    ofMonths: '{days} of {months}',
    inMonths: '{days} in {months}',
    in: 'in {months}',
    butOnlyOn: '{days}, but only on {weekdays}',
    orOn: '{days}, or on {weekdays}',
    orOnIn: '{days}, or on {weekdays}, in {months}',
    fixed: '{time} {days}',
    loose: '{time}, {days}'
  }
}
