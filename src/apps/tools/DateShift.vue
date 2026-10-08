<template>
  <div class="tool date-shift">
    <div class="tool-form">
      <label for="shift-base">起始日期：</label>
      <div class="tool-inline">
        <input id="shift-base" v-model="baseText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
        <button type="button" class="aqua-button" @click="baseText = todayText">今天</button>
      </div>
      <span class="tool-form__label">推算：</span>
      <div class="tool-inline">
        <div class="aqua-segmented" role="group" aria-label="加或减">
          <button type="button" :class="{ 'is-selected': sign === 1 }" :aria-pressed="sign === 1 ? 'true' : 'false'" @click="sign = 1">往后 +</button>
          <button type="button" :class="{ 'is-selected': sign === -1 }" :aria-pressed="sign === -1 ? 'true' : 'false'" @click="sign = -1">往前 −</button>
        </div>
        <input v-model.number="amount" type="number" min="0" max="100000" class="aqua-field tool-number" aria-label="数量">
        <select v-model="unit" class="aqua-popup" aria-label="单位">
          <option v-for="item in units" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </div>
    </div>

    <template v-if="result">
      <div class="tool-section">
        <h4>结果</h4>
        <p class="tool-big">{{ result.main.text }}</p>
        <p class="date-shift__sub">{{ result.main.detail }}</p>
        <p v-if="result.note" class="tool-note">{{ result.note }}</p>
      </div>

      <div class="tool-section">
        <h4>{{ sign > 0 ? '往后' : '往前' }} {{ amount }} 个单位的全部结果</h4>
        <div class="tool-table__wrap">
          <table class="tool-table">
            <thead>
              <tr><th>单位</th><th>日期</th><th>星期</th><th>农历</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in result.rows" :key="row.id" :class="{ 'is-selected': row.id === unit }">
                <td>{{ amount }} {{ row.short }}</td>
                <td>{{ row.ymd }}</td>
                <td>星期{{ row.week }}</td>
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
import { addDays, addMonths, formatChinese, formatYmd, isValidDate, parseYmd, today, weekday, WEEKDAYS } from './lib/dates'
import { lunarOf, lunarText, shiftWorkdays, uncoveredYears, MIN_YEAR, MAX_YEAR } from './lib/calendar'

const UNITS = [
  { id: 'day', label: '天', short: '天' },
  { id: 'week', label: '周', short: '周' },
  { id: 'month', label: '个月', short: '个月' },
  { id: 'year', label: '年', short: '年' },
  { id: 'workday', label: '个工作日（周一至周五）', short: '个工作日' },
  { id: 'official', label: '个工作日（法定节假日）', short: '个法定工作日' }
]

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
      unit: 'day',
      units: UNITS
    }
  },
  computed: {
    base() {
      return parseYmd(this.baseText)
    },
    error() {
      if (!this.base) {
        return '请输入有效的起始日期。'
      }
      return '数量请填写 0 到 100000 之间的整数。'
    },
    result() {
      const n = this.amount
      if (!this.base || !Number.isInteger(n) || n < 0 || n > 100000) {
        return null
      }
      const delta = n * this.sign
      const rows = UNITS.map(unit => {
        const date = this.apply(unit.id, delta)
        if (!date) {
          return { ...unit, ymd: '超出范围', week: '—', lunar: '—', date: null }
        }
        return {
          ...unit,
          date,
          ymd: formatYmd(date),
          week: WEEKDAYS[weekday(date)],
          lunar: date.y >= MIN_YEAR && date.y <= MAX_YEAR ? lunarText(lunarOf(date)) : '—'
        }
      })
      const main = rows.find(row => row.id === this.unit)
      let note = ''
      if (this.unit === 'official' && main.date) {
        const [from, to] = this.sign > 0 ? [this.base, main.date] : [main.date, this.base]
        const missing = uncoveredYears(from, to)
        if (missing.length) {
          note = `${missing.length > 4 ? `${missing[0]}–${missing[missing.length - 1]} 年中的部分年份` : `${missing.join('、')} 年`}没有法定放假数据，按周一至周五推算。`
        }
      }
      if (this.unit === 'month' || this.unit === 'year') {
        if (main.date && main.date.d !== this.base.d) {
          note = `目标月份没有 ${this.base.d} 日，已取当月最后一天。`
        }
      }
      return {
        rows,
        note,
        main: {
          text: main.date ? formatChinese(main.date) : '超出可计算范围',
          detail: main.date ? `星期${main.week}${main.lunar !== '—' ? ` · 农历${main.lunar}` : ''}` : ''
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
