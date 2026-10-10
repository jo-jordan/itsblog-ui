<template>
  <div class="tool converter">
    <fieldset class="aqua-group">
      <legend>{{ $t('tools.lunarConverter.toLunar') }}</legend>
      <div class="tool-form">
        <label for="conv-solar">{{ $t('tools.lunarConverter.solarDate') }}</label>
        <div class="tool-inline">
          <input id="conv-solar" v-model="solarText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31">
          <button type="button" class="aqua-button" @click="solarText = todayText">{{ $t('tools.common.today') }}</button>
        </div>
      </div>
      <dl v-if="solarResult" class="tool-results">
        <dt>{{ $t('tools.common.lunar') }}</dt>
        <dd><span class="tool-big">{{ solarResult.text }}</span></dd>
        <dt>{{ $t('tools.calendar.ganzhi') }}</dt>
        <dd>{{ solarResult.ganzhi }}</dd>
        <dt>{{ $t('tools.calendar.zodiac') }}</dt>
        <dd>{{ solarResult.shengxiao }}</dd>
        <dt>{{ $t('tools.lunarConverter.thisMonth') }}</dt>
        <dd>{{ solarResult.monthInfo }}</dd>
        <dt>{{ $t('tools.lunarConverter.thisYear') }}</dt>
        <dd>{{ solarResult.yearInfo }}</dd>
      </dl>
      <p v-else class="tool-error">{{ $t('tools.lunarConverter.outOfRange') }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>{{ $t('tools.lunarConverter.toSolar') }}</legend>
      <div class="tool-form">
        <span class="tool-form__label">{{ $t('tools.lunarConverter.lunarDate') }}</span>
        <lunar-date-picker v-model="lunar" />
      </div>
      <p class="tool-hint">{{ leapHint }}</p>
      <dl v-if="lunarResult" class="tool-results">
        <dt>{{ $t('tools.lunarConverter.solar') }}</dt>
        <dd><span class="tool-big">{{ lunarResult.text }}</span></dd>
        <dt>{{ $t('tools.calendar.weekday') }}</dt>
        <dd>{{ lunarResult.week }}</dd>
        <dt>{{ $t('tools.calendar.ganzhi') }}</dt>
        <dd>{{ lunarResult.ganzhi }}</dd>
        <dt>{{ $t('tools.calendar.fromToday') }}</dt>
        <dd>{{ lunarResult.distance }}</dd>
      </dl>
    </fieldset>
  </div>
</template>

<script>
import LunarDatePicker from './LunarDatePicker'
import { dayNumber, formatYmd, parseYmd, today, weekday } from './lib/dates'
import { daysAway, lunarMonthsOf, lunarOf, lunarText, lunarToSolar, zodiacName, MAX_YEAR, MIN_YEAR } from './lib/calendar'
import { formatLongDate, t, weekdayName } from './lib/i18n'

function ganzhiOf(lunar) {
  return t('tools.lunarConverter.ganzhi', { year: lunar.getYearInGanZhi(), month: lunar.getMonthInGanZhi(), day: lunar.getDayInGanZhi() })
}

function distanceText(date) {
  const days = dayNumber(date) - dayNumber(today())
  return days === 0 ? t('tools.lunarConverter.isToday') : daysAway(days)
}

function leapText(year) {
  const leap = lunarMonthsOf(year).find(item => item.leap)
  return leap
    ? t('tools.lunarConverter.leapYear', { year, month: leap.label, days: leap.days })
    : t('tools.lunarConverter.noLeap', { year })
}

export default {
  name: 'ToolLunarConverter',
  components: { LunarDatePicker },
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const now = lunarOf(today())
    return {
      todayText: formatYmd(today()),
      solarText: formatYmd(today()),
      lunar: { y: now.getYear(), m: now.getMonth(), d: now.getDay() }
    }
  },
  computed: {
    solarDate() {
      const date = parseYmd(this.solarText)
      return date && date.y >= MIN_YEAR && date.y <= MAX_YEAR ? date : null
    },
    solarResult() {
      if (!this.solarDate) {
        return null
      }
      const lunar = lunarOf(this.solarDate)
      const month = lunarMonthsOf(lunar.getYear()).find(item => item.value === lunar.getMonth())
      return {
        text: t('tools.lunarConverter.lunarFull', { year: lunar.getYear(), text: lunarText(lunar) }),
        ganzhi: ganzhiOf(lunar),
        shengxiao: t('tools.lunarConverter.zodiacYear', { zodiac: zodiacName(lunar.getYearShengXiao()) }),
        monthInfo: t(month.days === 30 ? 'tools.lunarConverter.longMonth' : 'tools.lunarConverter.shortMonth', { month: month.label, days: month.days }),
        yearInfo: leapText(lunar.getYear())
      }
    },
    leapHint() {
      return leapText(this.lunar.y)
    },
    lunarResult() {
      const date = lunarToSolar(this.lunar.y, this.lunar.m, this.lunar.d)
      if (!date) {
        return null
      }
      return {
        text: formatLongDate(date),
        week: weekdayName(weekday(date), 'long'),
        ganzhi: ganzhiOf(lunarOf(date)),
        distance: distanceText(date)
      }
    }
  }
}
</script>

<style lang="scss">
</style>
