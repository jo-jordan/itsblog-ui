<template>
  <div class="tool converter">
    <fieldset class="aqua-group">
      <legend>公历 → 农历</legend>
      <div class="tool-form">
        <label for="conv-solar">公历日期：</label>
        <div class="tool-inline">
          <input id="conv-solar" v-model="solarText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31">
          <button type="button" class="aqua-button" @click="solarText = todayText">今天</button>
        </div>
      </div>
      <dl v-if="solarResult" class="tool-results">
        <dt>农历</dt>
        <dd><span class="tool-big">{{ solarResult.text }}</span></dd>
        <dt>干支</dt>
        <dd>{{ solarResult.ganzhi }}</dd>
        <dt>生肖</dt>
        <dd>{{ solarResult.shengxiao }}</dd>
        <dt>本月</dt>
        <dd>{{ solarResult.monthInfo }}</dd>
        <dt>本年</dt>
        <dd>{{ solarResult.yearInfo }}</dd>
      </dl>
      <p v-else class="tool-error">请输入 1900 至 2100 年之间的公历日期。</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>农历 → 公历</legend>
      <div class="tool-form">
        <span class="tool-form__label">农历日期：</span>
        <lunar-date-picker v-model="lunar" />
      </div>
      <p class="tool-hint">{{ leapHint }}</p>
      <dl v-if="lunarResult" class="tool-results">
        <dt>公历</dt>
        <dd><span class="tool-big">{{ lunarResult.text }}</span></dd>
        <dt>星期</dt>
        <dd>星期{{ lunarResult.week }}</dd>
        <dt>干支</dt>
        <dd>{{ lunarResult.ganzhi }}</dd>
        <dt>距今</dt>
        <dd>{{ lunarResult.distance }}</dd>
      </dl>
    </fieldset>
  </div>
</template>

<script>
import LunarDatePicker from './LunarDatePicker'
import { dayNumber, formatYmd, parseYmd, today, weekday, WEEKDAYS } from './lib/dates'
import { lunarMonthsOf, lunarOf, lunarToSolar, MAX_YEAR, MIN_YEAR } from './lib/calendar'

function ganzhiOf(lunar) {
  return `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`
}

function distanceText(date) {
  const days = dayNumber(date) - dayNumber(today())
  if (days === 0) {
    return '就是今天'
  }
  return days > 0 ? `${days} 天后` : `${-days} 天前`
}

function leapText(year) {
  const leap = lunarMonthsOf(year).find(item => item.leap)
  return leap ? `农历${year}年有${leap.label}（${leap.days} 天），全年 13 个月。` : `农历${year}年没有闰月。`
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
        text: `${lunar.getYear()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
        ganzhi: ganzhiOf(lunar),
        shengxiao: `${lunar.getYearShengXiao()}年`,
        monthInfo: `${month.label}${month.days === 30 ? '大' : '小'}，共 ${month.days} 天`,
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
        text: `${date.y}年${date.m}月${date.d}日`,
        week: WEEKDAYS[weekday(date)],
        ganzhi: ganzhiOf(lunarOf(date)),
        distance: distanceText(date)
      }
    }
  }
}
</script>

<style lang="scss">
</style>
