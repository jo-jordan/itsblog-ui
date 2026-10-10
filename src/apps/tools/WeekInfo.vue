<template>
  <div class="tool week-info">
    <div class="tool-bar">
      <label for="week-date">{{ $t('tools.weekInfo.date') }}</label>
      <input id="week-date" v-model="dateText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
      <button type="button" class="aqua-button" :aria-label="$t('tools.weekInfo.previousWeek')" @click="move(-7)">◀ {{ $t('tools.weekInfo.previousWeek') }}</button>
      <button type="button" class="aqua-button" :aria-label="$t('tools.weekInfo.nextWeek')" @click="move(7)">{{ $t('tools.weekInfo.nextWeek') }} ▶</button>
      <button type="button" class="aqua-button" @click="dateText = todayText">{{ $t('tools.common.today') }}</button>
    </div>

    <template v-if="info">
      <p class="tool-big">{{ info.week }}</p>
      <p class="week-info__iso">{{ info.isoLabel }}</p>
      <dl class="tool-results">
        <dt>{{ $t('tools.weekInfo.isoWeek') }}</dt>
        <dd>{{ $t('tools.weekInfo.weekNumber', { n: info.isoWeek }) }} <small>{{ $t('tools.weekInfo.isoDetail', { year: info.isoYear, weeks: info.isoWeeks }) }}</small></dd>
        <dt>{{ $t('tools.weekInfo.thisWeek') }}</dt>
        <dd>{{ info.weekRange }}</dd>
        <dt>{{ $t('tools.weekInfo.weekOfMonth') }}</dt>
        <dd>{{ $t('tools.weekInfo.weekNumber', { n: info.weekOfMonth }) }} <small>{{ $t('tools.weekInfo.weekOfMonthHint') }}</small></dd>
        <dt>{{ $t('tools.weekInfo.dayOfYear') }}</dt>
        <dd>{{ $t('tools.weekInfo.dayOfYearValue', { n: info.dayOfYear }) }} <small>{{ $t('tools.weekInfo.dayOfYearDetail', { total: info.daysInYear, percent: info.percent }) }}</small></dd>
        <dt>{{ $t('tools.weekInfo.remaining') }}</dt>
        <dd>{{ $tc('tools.common.days', info.remaining) }}</dd>
        <dt>{{ $t('tools.weekInfo.quarter') }}</dt>
        <dd>{{ $t('tools.weekInfo.quarterValue', { q: info.quarter }) }} <small>{{ $t('tools.weekInfo.dayOfQuarter', { n: info.dayOfQuarter }) }}</small></dd>
        <dt>{{ $t('tools.weekInfo.thisMonth') }}</dt>
        <dd>{{ $tc('tools.common.days', info.monthDays) }}</dd>
        <dt>{{ $t('tools.weekInfo.leapYear') }}</dt>
        <dd>{{ $t(info.leap ? 'tools.weekInfo.isLeap' : 'tools.weekInfo.notLeap', { year: info.year }) }}</dd>
      </dl>
    </template>
    <p v-else class="tool-error">{{ $t('tools.weekInfo.invalid') }}</p>
  </div>
</template>

<script>
import { addDays, dayNumber, dayOfYear, daysInMonth, formatYmd, isLeapYear, isoWeek, parseYmd, pad, today, weekday } from './lib/dates'
import { t, weekdayName } from './lib/i18n'

export default {
  name: 'ToolWeekInfo',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      todayText: formatYmd(today()),
      dateText: formatYmd(today())
    }
  },
  computed: {
    info() {
      const date = parseYmd(this.dateText)
      if (!date) {
        return null
      }
      const iso = isoWeek(date)
      const isoDay = weekday(date) || 7
      const monday = addDays(date, 1 - isoDay)
      const sunday = addDays(monday, 6)
      // A year has 53 ISO weeks when 28 December falls in week 53
      const isoWeeks = isoWeek({ y: iso.year, m: 12, d: 28 }).week
      const daysInYear = isLeapYear(date.y) ? 366 : 365
      const doy = dayOfYear(date)
      const quarter = Math.ceil(date.m / 3)
      const quarterStart = { y: date.y, m: quarter * 3 - 2, d: 1 }
      const firstOfMonth = { y: date.y, m: date.m, d: 1 }
      const lead = (weekday(firstOfMonth) || 7) - 1
      return {
        year: date.y,
        week: weekdayName(weekday(date), 'long'),
        isoLabel: `${iso.year}-W${pad(iso.week)}-${isoDay}`,
        isoWeek: iso.week,
        isoYear: iso.year,
        isoWeeks,
        weekRange: t('tools.weekInfo.weekRange', { from: formatYmd(monday), monday: weekdayName(1), to: formatYmd(sunday), sunday: weekdayName(0) }),
        weekOfMonth: Math.floor((date.d + lead - 1) / 7) + 1,
        dayOfYear: doy,
        daysInYear,
        percent: ((doy / daysInYear) * 100).toFixed(1),
        remaining: daysInYear - doy,
        quarter,
        dayOfQuarter: dayNumber(date) - dayNumber(quarterStart) + 1,
        monthDays: daysInMonth(date.y, date.m),
        leap: isLeapYear(date.y)
      }
    }
  },
  methods: {
    move(days) {
      const date = parseYmd(this.dateText) || today()
      this.dateText = formatYmd(addDays(date, days))
    }
  }
}
</script>

<style lang="scss">
.week-info__iso {
  margin: 0 0 12px;
  font-family: Monaco, Menlo, monospace;
  color: #555;
}
</style>
