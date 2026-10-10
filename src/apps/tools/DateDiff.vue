<template>
  <div class="tool date-diff">
    <div class="tool-form">
      <label for="diff-start">{{ $t('tools.dateDiff.start') }}</label>
      <div class="tool-inline">
        <input id="diff-start" v-model="startText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
        <button type="button" class="aqua-button" @click="startText = todayText">{{ $t('tools.common.today') }}</button>
      </div>
      <label for="diff-end">{{ $t('tools.dateDiff.end') }}</label>
      <div class="tool-inline">
        <input id="diff-end" v-model="endText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
        <button type="button" class="aqua-button" @click="endText = todayText">{{ $t('tools.common.today') }}</button>
        <button type="button" class="aqua-button" @click="swap">⇅ {{ $t('tools.common.swap') }}</button>
      </div>
      <span />
      <label class="tool-inline">
        <input v-model="inclusive" type="checkbox">
        <span>{{ $t('tools.dateDiff.inclusive') }}</span>
      </label>
    </div>

    <template v-if="result">
      <div class="tool-section">
        <h4>{{ $t('tools.dateDiff.difference') }}</h4>
        <p class="tool-big">{{ 0 > result.sign ? '−' : '' }}{{ amount('days', result.days, true) }}</p>
        <dl class="tool-results">
          <dt>{{ $t('tools.dateDiff.weeks') }}</dt>
          <dd>{{ amount('weeks', result.weeks) }} {{ amount('days', result.weekDays) }}</dd>
          <dt>{{ $t('tools.dateDiff.months') }}</dt>
          <dd>{{ amount('months', result.months) }} {{ amount('days', result.monthsRest) }}</dd>
          <dt>{{ $t('tools.dateDiff.years') }}</dt>
          <dd>{{ amount('years', result.years) }} {{ amount('months', result.yearMonths) }} {{ amount('days', result.monthsRest) }}</dd>
          <dt>{{ $t('tools.dateDiff.equals') }}</dt>
          <dd>{{ amount('hours', result.days * 24, true) }} · {{ amount('minutes', result.days * 1440, true) }} · {{ amount('seconds', result.days * 86400, true) }}</dd>
        </dl>
        <p v-if="result.sign < 0" class="tool-hint">{{ $t('tools.dateDiff.reversed') }}</p>
      </div>

      <div class="tool-section">
        <h4>{{ $t('tools.dateDiff.workdays') }}</h4>
        <dl class="tool-results">
          <dt>{{ $t('tools.dateDiff.monToFri') }}</dt>
          <dd>{{ amount('days', result.weekdays, true) }} <small>{{ $tc('tools.dateDiff.weekendDays', result.calendarDays - result.weekdays) }}</small></dd>
          <dt>{{ $t('tools.dateDiff.official') }}</dt>
          <dd>
            {{ amount('days', result.official, true) }}
            <small>{{ $t('tools.dateDiff.officialHint') }}</small>
          </dd>
        </dl>
        <p v-if="result.uncovered" class="tool-note">{{ $t('tools.dateDiff.noData', { years: result.uncovered }) }}</p>
      </div>
    </template>
    <p v-else class="tool-error">{{ $t('tools.dateDiff.invalid') }}</p>
  </div>
</template>

<script>
import { addDays, countWeekdays, formatYmd, parseYmd, span, today, compare } from './lib/dates'
import { countOfficialWorkdays, uncoveredYears } from './lib/calendar'
import { formatNumber, t, tc } from './lib/i18n'

function yearsText(years) {
  if (!years.length) {
    return ''
  }
  if (years.length > 4) {
    return t('tools.dateDiff.yearRange', { from: years[0], to: years[years.length - 1], n: years.length })
  }
  return t('tools.dateDiff.yearList', { list: years.join(t('tools.dateDiff.listSeparator')) })
}

export default {
  name: 'ToolDateDiff',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const now = today()
    return {
      todayText: formatYmd(now),
      startText: formatYmd(now),
      endText: formatYmd({ y: now.y, m: 12, d: 31 }),
      inclusive: false
    }
  },
  computed: {
    result() {
      const a = parseYmd(this.startText)
      const b = parseYmd(this.endText)
      if (!a || !b) {
        return null
      }
      const [from, to] = compare(a, b) <= 0 ? [a, b] : [b, a]
      // The "inclusive" option counts the end day as well
      const end = this.inclusive ? addDays(to, 1) : to
      const parts = span(from, end)
      const uncovered = uncoveredYears(from, to)
      return {
        ...parts,
        sign: compare(a, b) <= 0 ? 1 : -1,
        calendarDays: parts.days + (this.inclusive ? 0 : 1),
        weekdays: countWeekdays(from, to),
        official: countOfficialWorkdays(from, to),
        uncovered: yearsText(uncovered)
      }
    }
  },
  methods: {
    // "3 days"; `grouped` writes the number as 1,234
    amount(unit, n, grouped = false) {
      return tc(`tools.common.${unit}`, n, { n: grouped ? formatNumber(n) : n })
    },
    swap() {
      [this.startText, this.endText] = [this.endText, this.startText]
    }
  }
}
</script>
