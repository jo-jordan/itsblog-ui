<template>
  <div class="tool date-shift">
    <div class="tool-form">
      <label for="shift-base">{{ $t('tools.dateShift.base') }}</label>
      <div class="tool-inline">
        <input id="shift-base" v-model="baseText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
        <button type="button" class="aqua-button" @click="baseText = todayText">{{ $t('tools.common.today') }}</button>
      </div>
      <span class="tool-form__label">{{ $t('tools.dateShift.shift') }}</span>
      <div class="tool-inline">
        <div class="aqua-segmented" role="group" :aria-label="$t('tools.dateShift.direction')">
          <button type="button" :class="{ 'is-selected': sign === 1 }" :aria-pressed="sign === 1 ? 'true' : 'false'" @click="sign = 1">{{ $t('tools.dateShift.forward') }}</button>
          <button type="button" :class="{ 'is-selected': sign === -1 }" :aria-pressed="sign === -1 ? 'true' : 'false'" @click="sign = -1">{{ $t('tools.dateShift.back') }}</button>
        </div>
        <input v-model.number="amount" type="number" min="0" max="100000" class="aqua-field tool-number" :aria-label="$t('tools.dateShift.amount')">
        <select v-model="unit" class="aqua-popup" :aria-label="$t('tools.dateShift.unit')">
          <option v-for="item in units" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </div>
    </div>

    <template v-if="result">
      <div class="tool-section">
        <h4>{{ $t('tools.dateShift.result') }}</h4>
        <p class="tool-big">{{ result.main.text }}</p>
        <p class="date-shift__sub">{{ result.main.detail }}</p>
        <p v-if="result.note" class="tool-note">{{ result.note }}</p>
      </div>

      <div class="tool-section">
        <h4>{{ $t(sign > 0 ? 'tools.dateShift.allForward' : 'tools.dateShift.allBack', { n: amount }) }}</h4>
        <div class="tool-table__wrap">
          <table class="tool-table">
            <thead>
              <tr><th>{{ $t('tools.dateShift.unit') }}</th><th>{{ $t('tools.dateShift.date') }}</th><th>{{ $t('tools.dateShift.weekday') }}</th><th>{{ $t('tools.common.lunar') }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in result.rows" :key="row.id" :class="{ 'is-selected': row.id === unit }">
                <td>{{ $tc(`tools.dateShift.amounts.${row.id}`, amount) }}</td>
                <td>{{ row.ymd }}</td>
                <td>{{ row.week }}</td>
                <td>{{ row.lunar }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
    <p v-else class="tool-error">{{ error }}</p>
  </div>
</template>

<script>
import { addDays, addMonths, formatYmd, isValidDate, parseYmd, today, weekday } from './lib/dates'
import { lunarDateText, lunarOf, lunarText, shiftWorkdays, uncoveredYears, MIN_YEAR, MAX_YEAR } from './lib/calendar'
import { formatLongDate, t, weekdayName } from './lib/i18n'

// 'workday' skips weekends, 'official' follows the Chinese public holiday arrangement
const UNITS = ['day', 'week', 'month', 'year', 'workday', 'official']

export default {
  name: 'ToolDateShift',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      todayText: formatYmd(today()),
      baseText: formatYmd(today()),
      sign: 1,
      amount: 100,
      unit: 'day'
    }
  },
  computed: {
    base() {
      return parseYmd(this.baseText)
    },
    units() {
      return UNITS.map(id => ({ id, label: t(`tools.dateShift.units.${id}`) }))
    },
    error() {
      if (!this.base) {
        return t('tools.dateShift.invalidBase')
      }
      return t('tools.dateShift.invalidAmount')
    },
    result() {
      const n = this.amount
      if (!this.base || !Number.isInteger(n) || n < 0 || n > 100000) {
        return null
      }
      const delta = n * this.sign
      const rows = UNITS.map(id => {
        const date = this.apply(id, delta)
        if (!date) {
          return { id, ymd: t('tools.dateShift.outOfRange'), week: '—', lunar: '—', date: null }
        }
        const lunar = date.y >= MIN_YEAR && date.y <= MAX_YEAR ? lunarOf(date) : null
        return {
          id,
          date,
          ymd: formatYmd(date),
          week: weekdayName(weekday(date), 'long'),
          lunar: lunar ? lunarText(lunar) : '—',
          lunarLine: lunar ? lunarDateText(lunar) : ''
        }
      })
      const main = rows.find(row => row.id === this.unit)
      let note = ''
      if (this.unit === 'official' && main.date) {
        const [from, to] = this.sign > 0 ? [this.base, main.date] : [main.date, this.base]
        const missing = uncoveredYears(from, to)
        if (missing.length) {
          note = missing.length > 4
            ? t('tools.dateShift.noDataRange', { from: missing[0], to: missing[missing.length - 1] })
            : t('tools.dateShift.noDataList', { years: missing.join(t('tools.dateShift.listSeparator')) })
        }
      }
      if (this.unit === 'month' || this.unit === 'year') {
        if (main.date && main.date.d !== this.base.d) {
          note = t('tools.dateShift.clamped', { d: this.base.d })
        }
      }
      return {
        rows,
        note,
        main: {
          text: main.date ? formatLongDate(main.date) : t('tools.dateShift.beyondRange'),
          detail: main.date ? [main.week, main.lunarLine].filter(Boolean).join(' · ') : ''
        }
      }
    }
  },
  methods: {
    apply(unit, delta) {
      let date
      if (unit === 'day') {
        date = addDays(this.base, delta)
      } else if (unit === 'week') {
        date = addDays(this.base, delta * 7)
      } else if (unit === 'month') {
        date = addMonths(this.base, delta)
      } else if (unit === 'year') {
        date = addMonths(this.base, delta * 12)
      } else {
        date = shiftWorkdays(this.base, delta, unit === 'official')
      }
      return isValidDate(date) ? date : null
    }
  }
}
</script>

<style lang="scss">
.date-shift__sub {
  margin: 2px 0 0;
  color: #555;
}
</style>
