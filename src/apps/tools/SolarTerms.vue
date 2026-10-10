<template>
  <div class="tool terms">
    <div class="tool-bar">
      <button type="button" class="aqua-button" :aria-label="$t('tools.calendar.previousYear')" @click="year = Math.max(minYear, year - 1)">◀</button>
      <label for="terms-year">{{ $t('tools.calendar.yearLabel') }}</label>
      <input id="terms-year" v-model.number="year" type="number" class="aqua-field tool-number" :min="minYear" :max="maxYear">
      <button type="button" class="aqua-button" :aria-label="$t('tools.calendar.nextYear')" @click="year = Math.min(maxYear, year + 1)">▶</button>
      <button type="button" class="aqua-button" @click="year = thisYear">{{ $t('tools.calendar.thisYear') }}</button>
    </div>

    <template v-if="valid">
      <div class="tool-table__wrap">
        <table class="tool-table">
          <thead>
            <tr>
              <th>{{ $t('tools.solarTerms.term') }}</th>
              <th>{{ $t('tools.solarTerms.kind') }}</th>
              <th>{{ $t('tools.solarTerms.moment') }}</th>
              <th>{{ $t('tools.calendar.weekday') }}</th>
              <th>{{ $t('tools.common.lunar') }}</th>
              <th>{{ $t('tools.calendar.fromToday') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="term in terms" :key="term.key" :class="{ 'is-selected': term.next }">
              <td><strong>{{ term.name }}</strong></td>
              <td>{{ term.kind }}</td>
              <td>{{ term.time }}</td>
              <td>{{ term.week }}</td>
              <td>{{ term.lunar }}</td>
              <td>{{ term.distance }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="tool-hint">{{ $t('tools.solarTerms.hint') }}</p>
    </template>
    <p v-else class="tool-error">{{ $t('tools.solarTerms.outOfRange', { min: minYear, max: maxYear }) }}</p>
  </div>
</template>

<script>
import { dayNumber, today, weekday } from './lib/dates'
import { beijingEpoch, daysAway, lunarText, solarTermsOf, termName } from './lib/calendar'
import { t, weekdayName } from './lib/i18n'

export default {
  name: 'ToolSolarTerms',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      thisYear: today().y,
      year: today().y,
      minYear: 1900,
      maxYear: 2100
    }
  },
  computed: {
    valid() {
      return Number.isInteger(this.year) && this.year >= this.minYear && this.year <= this.maxYear
    },
    terms() {
      if (!this.valid) {
        return []
      }
      const now = Date.now()
      const todayNumber = dayNumber(today())
      // The very next term from now, which may sit in another year than the one shown
      const upcoming = [...solarTermsOf(this.thisYear), ...solarTermsOf(this.thisYear + 1)].find(term => beijingEpoch(term.solar) > now)
      const nextKey = upcoming ? upcoming.solar.toYmdHms() : null
      return solarTermsOf(this.year).map(({ name, solar, jie }) => {
        const date = { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay() }
        const days = dayNumber(date) - todayNumber
        return {
          key: name,
          name: termName(name),
          kind: t(jie ? 'tools.solarTerms.jie' : 'tools.solarTerms.qi'),
          time: solar.toYmdHms(),
          week: weekdayName(weekday(date), 'long'),
          lunar: lunarText(solar.getLunar()),
          distance: days === 0 ? t('tools.common.today') : daysAway(days),
          next: solar.toYmdHms() === nextKey
        }
      })
    }
  }
}
</script>
