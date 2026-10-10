<template>
  <span class="tool-inline lunar-picker">
    <select :value="value.y" class="aqua-popup" :aria-label="aria('pickerYear')" @change="update({ y: +$event.target.value })">
      <option v-for="y in years" :key="y" :value="y">{{ $t('tools.calendar.yearOption', { y }) }}</option>
    </select>
    <select :value="month.value" class="aqua-popup" :aria-label="aria('pickerMonth')" @change="update({ m: +$event.target.value })">
      <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <select :value="Math.min(value.d, month.days)" class="aqua-popup" :aria-label="aria('pickerDay')" @change="update({ d: +$event.target.value })">
      <option v-for="d in month.days" :key="d" :value="d">{{ dayName(d) }}</option>
    </select>
  </span>
</template>

<script>
import { lunarDayName, lunarMonthsOf, MAX_YEAR, MIN_YEAR } from './lib/calendar'

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
      return lunarDayName(d)
    },
    // `label` says whose date it is (it may be empty)
    aria(key) {
      return this.$t(`tools.calendar.${key}`, { label: this.label }).trim()
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
