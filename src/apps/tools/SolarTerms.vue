<template>
  <div class="tool terms">
    <div class="tool-bar">
      <button type="button" class="aqua-button" aria-label="上一年" @click="year = Math.max(minYear, year - 1)">◀</button>
      <label for="terms-year">年份：</label>
      <input id="terms-year" v-model.number="year" type="number" class="aqua-field tool-number" :min="minYear" :max="maxYear">
      <button type="button" class="aqua-button" aria-label="下一年" @click="year = Math.min(maxYear, year + 1)">▶</button>
      <button type="button" class="aqua-button" @click="year = thisYear">今年</button>
    </div>

    <template v-if="valid">
      <div class="tool-table__wrap">
        <table class="tool-table">
          <thead>
            <tr><th>节气</th><th>类别</th><th>交节时刻（北京时间）</th><th>星期</th><th>农历</th><th>距今</th></tr>
          </thead>
          <tbody>
            <tr v-for="term in terms" :key="term.name" :class="{ 'is-selected': term.next }">
              <td><strong>{{ term.name }}</strong></td>
              <td>{{ term.kind }}</td>
              <td>{{ term.time }}</td>
              <td>星期{{ term.week }}</td>
              <td>{{ term.lunar }}</td>
              <td>{{ term.distance }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="tool-hint">“节”为每月干支的分界，“气”为中气。高亮的是下一个节气。时刻由 lunar-javascript 依寿星天文历算法给出，精确到秒。</p>
    </template>
    <p v-else class="tool-error">请输入 {{ minYear }} 至 {{ maxYear }} 之间的年份。</p>
  </div>
</template>

<script>
import { dayNumber, today, weekday, WEEKDAYS } from './lib/dates'
import { beijingEpoch, lunarText, solarTermsOf } from './lib/calendar'

const JIE = ['小寒', '立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪']

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
      return solarTermsOf(this.year).map(({ name, solar }) => {
        const date = { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay() }
        const days = dayNumber(date) - todayNumber
        return {
          name,
          kind: JIE.includes(name) ? '节' : '气',
          time: solar.toYmdHms(),
          week: WEEKDAYS[weekday(date)],
          lunar: lunarText(solar.getLunar()),
          distance: days === 0 ? '今天' : days > 0 ? `${days} 天后` : `${-days} 天前`,
          next: solar.toYmdHms() === nextKey
        }
      })
    }
  }
}
</script>
