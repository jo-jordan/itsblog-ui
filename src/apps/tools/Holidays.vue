<template>
  <div class="tool holidays">
    <div class="tool-bar">
      <button type="button" class="aqua-button" :aria-label="$t('tools.calendar.previousYear')" @click="year = Math.max(years[0], year - 1)">◀</button>
      <label for="holidays-year">{{ $t('tools.calendar.yearLabel') }}</label>
      <select id="holidays-year" v-model.number="year" class="aqua-popup">
        <option v-for="y in years" :key="y" :value="y">{{ $t('tools.calendar.yearOption', { y }) }}</option>
      </select>
      <button type="button" class="aqua-button" :aria-label="$t('tools.calendar.nextYear')" @click="year = Math.min(years[years.length - 1], year + 1)">▶</button>
      <button type="button" class="aqua-button" @click="year = thisYear">{{ $t('tools.calendar.thisYear') }}</button>
    </div>

    <template v-if="covered">
      <i18n-t keypath="tools.holidays.summary" tag="p" class="holidays__summary" scope="global">
        <template #year>{{ year }}</template>
        <template #rest><strong>{{ totals.rest }}</strong></template>
        <template #work><strong>{{ totals.work }}</strong></template>
        <template #workdays><strong>{{ totals.workdays }}</strong></template>
      </i18n-t>
      <div class="tool-table__wrap">
        <table class="tool-table">
          <thead>
            <tr>
              <th>{{ $t('tools.holidays.holiday') }}</th>
              <th>{{ $t('tools.holidays.daysOff') }}</th>
              <th>{{ $t('tools.holidays.length') }}</th>
              <th>{{ $t('tools.holidays.makeUp') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.key">
              <td><strong>{{ item.name }}</strong><br><small class="tool-muted">{{ item.target }}</small></td>
              <td>{{ item.rest }}</td>
              <td>{{ $tc('tools.common.days', item.days) }}</td>
              <td>{{ item.work || $t('tools.calendar.none') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <p v-else class="tool-note">
      {{ $t('tools.holidays.uncovered', { version, year, first: range[0], last: range[1] }) }}
    </p>
    <p class="tool-hint">{{ $t('tools.holidays.source') }}</p>
  </div>
</template>

<script>
import { today, weekday } from './lib/dates'
import { countOfficialWorkdays, hasHolidayData, holidayDataRange, holidayMap, holidayName } from './lib/calendar'
import { formatMonthDay, t, weekdayName } from './lib/i18n'
import { version } from 'lunar-javascript/package.json'

function toDate(text) {
  const [y, m, d] = text.split('-').map(Number)
  return { y, m, d }
}

function dayLabel(text) {
  const date = toDate(text)
  return t('tools.holidays.day', { date: formatMonthDay(date), week: weekdayName(weekday(date), 'short') })
}

export default {
  name: 'ToolHolidays',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const [first, last] = holidayDataRange()
    const thisYear = today().y
    return {
      version,
      thisYear,
      year: thisYear,
      range: [first, last],
      years: Array.from({ length: Math.max(last, thisYear) + 2 - first + 1 }, (_, i) => first + i)
    }
  },
  computed: {
    covered() {
      return hasHolidayData(this.year)
    },
    // Arranged days of the year (plus December days of the previous year that
    // belong to this year's New Year), grouped by holiday
    items() {
      const prefix = String(this.year)
      const days = [...Object.values(holidayMap(this.year - 1)), ...Object.values(holidayMap(this.year))]
        .filter(holiday => holiday.target.slice(0, 4) === prefix)
      const groups = {}
      days.forEach(holiday => {
        const key = `${holiday.name}|${holiday.target}`
        groups[key] = groups[key] || { name: holiday.name, target: holiday.target, rest: [], work: [] }
        groups[key][holiday.work ? 'work' : 'rest'].push(holiday.day)
      })
      return Object.keys(groups)
        .map(key => groups[key])
        .sort((a, b) => (a.rest[0] || a.work[0]).localeCompare(b.rest[0] || b.work[0]))
        .map(group => {
          const rest = group.rest.sort()
          return {
            key: `${group.name}${group.target}`,
            name: holidayName(group.name),
            target: formatMonthDay(toDate(group.target)),
            rest: rest.length ? (rest.length > 1 ? t('tools.holidays.range', { from: dayLabel(rest[0]), to: dayLabel(rest[rest.length - 1]) }) : dayLabel(rest[0])) : '—',
            days: rest.length,
            workCount: group.work.length,
            work: group.work.sort().map(dayLabel).join(t('tools.calendar.listSeparator'))
          }
        })
    },
    totals() {
      const year = this.year
      const start = { y: year, m: 1, d: 1 }
      const end = { y: year, m: 12, d: 31 }
      return {
        rest: this.items.reduce((sum, item) => sum + item.days, 0),
        work: this.items.reduce((sum, item) => sum + item.workCount, 0),
        workdays: countOfficialWorkdays(start, end)
      }
    }
  }
}
</script>

<style lang="scss">
.holidays__summary {
  margin: 0 0 10px;
}
</style>
