<template>
  <div class="tool date-diff">
    <div class="tool-form">
      <label for="diff-start">开始日期：</label>
      <div class="tool-inline">
        <input id="diff-start" v-model="startText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
        <button type="button" class="aqua-button" @click="startText = todayText">今天</button>
      </div>
      <label for="diff-end">结束日期：</label>
      <div class="tool-inline">
        <input id="diff-end" v-model="endText" type="date" class="aqua-field" min="0001-01-01" max="9999-12-31">
        <button type="button" class="aqua-button" @click="endText = todayText">今天</button>
        <button type="button" class="aqua-button" @click="swap">⇅ 交换</button>
      </div>
      <span />
      <label class="tool-inline">
        <input v-model="inclusive" type="checkbox">
        <span>算头又算尾（天数 +1）</span>
      </label>
    </div>

    <template v-if="result">
      <div class="tool-section">
        <h4>相差</h4>
        <p class="tool-big">{{ result.sign < 0 ? '−' : '' }}{{ result.days.toLocaleString('zh-CN') }} 天</p>
        <dl class="tool-results">
          <dt>周</dt>
          <dd>{{ result.weeks }} 周 {{ result.weekDays }} 天</dd>
          <dt>月</dt>
          <dd>{{ result.months }} 个月 {{ result.monthsRest }} 天</dd>
          <dt>年</dt>
          <dd>{{ result.years }} 年 {{ result.yearMonths }} 个月 {{ result.monthsRest }} 天</dd>
          <dt>折合</dt>
          <dd>{{ (result.days * 24).toLocaleString('zh-CN') }} 小时 · {{ (result.days * 1440).toLocaleString('zh-CN') }} 分钟 · {{ (result.days * 86400).toLocaleString('zh-CN') }} 秒</dd>
        </dl>
        <p v-if="result.sign < 0" class="tool-hint">结束日期早于开始日期，按倒序计算。</p>
      </div>

      <div class="tool-section">
        <h4>工作日（含起止两天）</h4>
        <dl class="tool-results">
          <dt>周一至周五</dt>
          <dd>{{ result.weekdays.toLocaleString('zh-CN') }} 天 <small>周末 {{ result.calendarDays - result.weekdays }} 天</small></dd>
          <dt>按法定节假日</dt>
          <dd>
            {{ result.official.toLocaleString('zh-CN') }} 天
            <small>扣除法定假日，计入调休上班日</small>
          </dd>
        </dl>
        <p v-if="result.uncovered" class="tool-note">{{ result.uncovered }}没有法定放假数据，这些年份按周一至周五计算。</p>
      </div>
    </template>
    <p v-else class="tool-error">请输入两个有效日期。</p>
  </div>
</template>

<script>
import { addDays, countWeekdays, formatYmd, parseYmd, span, today, compare } from './lib/dates'
import { countOfficialWorkdays, uncoveredYears } from './lib/calendar'

function yearsText(years) {
  if (!years.length) {
    return ''
  }
  if (years.length > 4) {
    return `${years[0]}–${years[years.length - 1]} 年中有 ${years.length} 个年份`
  }
  return `${years.join('、')} 年`
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
      // "算头又算尾" counts the end day as well
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
    swap() {
      ;[this.startText, this.endText] = [this.endText, this.startText]
    }
  }
}
</script>
