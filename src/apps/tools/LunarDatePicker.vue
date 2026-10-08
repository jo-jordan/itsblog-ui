<template>
  <span class="tool-inline lunar-picker">
    <select :value="value.y" class="aqua-popup" :aria-label="`${label}农历年`" @change="update({ y: +$event.target.value })">
      <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
    </select>
    <select :value="month.value" class="aqua-popup" :aria-label="`${label}农历月`" @change="update({ m: +$event.target.value })">
      <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <select :value="Math.min(value.d, month.days)" class="aqua-popup" :aria-label="`${label}农历日`" @change="update({ d: +$event.target.value })">
      <option v-for="d in month.days" :key="d" :value="d">{{ dayName(d) }}</option>
    </select>
  </span>
</template>

<script>
import { lunarMonthsOf, MAX_YEAR, MIN_YEAR } from './lib/calendar'

const DAY_NAMES = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

// Lunar year / month (leap months negative) / day pickers; v-model is { y, m, d }
export default {
  name: 'LunarDatePicker',
  props: {
    value: { type: Object, required: true },
    label: { type: String, default: '' }
  },
  data() {
    return {
      years: Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)
    }
  },
  computed: {
    months() {
      return lunarMonthsOf(this.value.y)
    },
    month() {
      return this.months.find(item => item.value === this.value.m) || this.months.find(item => item.value === Math.abs(this.value.m))
    }
  },
  methods: {
    dayName(d) {
      return DAY_NAMES[d - 1]
    },
    // Keep the date valid: a leap month the new year lacks becomes the ordinary month, days are clamped
    update(change) {
      const next = { ...this.value, ...change }
      const months = lunarMonthsOf(next.y)
      const month = months.find(item => item.value === next.m) || months.find(item => item.value === Math.abs(next.m))
      next.m = month.value
      next.d = Math.min(next.d, month.days)
      this.$emit('input', next)
    }
  }
}
</script>
