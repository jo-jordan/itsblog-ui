<template>
  <div class="tool holidays">
    <div class="tool-bar">
      <button type="button" class="aqua-button" aria-label="上一年" @click="year = Math.max(years[0], year - 1)">◀</button>
      <label for="holidays-year">年份：</label>
      <select id="holidays-year" v-model.number="year" class="aqua-popup">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>
      <button type="button" class="aqua-button" aria-label="下一年" @click="year = Math.min(years[years.length - 1], year + 1)">▶</button>
      <button type="button" class="aqua-button" @click="year = thisYear">今年</button>
    </div>

    <template v-if="covered">
      <p class="holidays__summary">
        {{ year }} 年共 <strong>{{ totals.rest }}</strong> 天假期（含周末），调休上班 <strong>{{ totals.work }}</strong> 天，全年法定工作日 <strong>{{ totals.workdays }}</strong> 天。
      </p>
      <div class="tool-table__wrap">
        <table class="tool-table">
          <thead>
            <tr><th>节日</th><th>放假时间</th><th>天数</th><th>调休上班</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.key">
              <td><strong>{{ item.name }}</strong><br><small class="tool-muted">{{ item.target }}</small></td>
              <td>{{ item.rest }}</td>
              <td>{{ item.days }} 天</td>
              <td>{{ item.work || '无' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <p v-else class="tool-note">
      lunar-javascript {{ version }} 中没有 {{ year }} 年的放假安排，因此这里不显示任何日期，以免误导。现有数据覆盖 {{ range[0] }}–{{ range[1] }} 年；国务院办公厅通常在前一年的 11–12 月公布下一年的安排，届时更新依赖即可。
    </p>
    <p class="tool-hint">数据来自 lunar-javascript 内置的国务院办公厅节假日安排。</p>
  </div>
</template>

<script>
import { today, weekday, WEEKDAYS } from './lib/dates'
import { countOfficialWorkdays, hasHolidayData, holidayDataRange, holidayMap } from './lib/calendar'
import { version } from 'lunar-javascript/package.json'

function toDate(text) {
  const [y, m, d] = text.split('-').map(Number)
  return { y, m, d }
}

function dayLabel(text) {
  const date = toDate(text)
  return `${date.m}月${date.d}日（周${WEEKDAYS[weekday(date)]}）`
}

export default {
  name: 'ToolHolidays',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const [first, last] = holidayDataRange()
    const thisYear = today().y
    return {
      version,
      thisYear,
      year: thisYear,
      range: [first, last],
      years: Array.from({ length: Math.max(last, thisYear) + 2 - first + 1 }, (_, i) => first + i)
    }
  },
  computed: {
    covered() {
      return hasHolidayData(this.year)
    },
    // Arranged days of the year (plus December days of the previous year that
    // belong to this year's New Year), grouped by holiday
    items() {
      const prefix = String(this.year)
      const days = [...Object.values(holidayMap(this.year - 1)), ...Object.values(holidayMap(this.year))]
        .filter(holiday => holiday.target.slice(0, 4) === prefix)
      const groups = {}
      days.forEach(holiday => {
        const key = `${holiday.name}|${holiday.target}`
        groups[key] = groups[key] || { name: holiday.name, target: holiday.target, rest: [], work: [] }
        groups[key][holiday.work ? 'work' : 'rest'].push(holiday.day)
      })
      return Object.keys(groups)
        .map(key => groups[key])
        .sort((a, b) => (a.rest[0] || a.work[0]).localeCompare(b.rest[0] || b.work[0]))
        .map(group => {
          const rest = group.rest.sort()
          return {
            key: `${group.name}${group.target}`,
            name: group.name,
            target: `${toDate(group.target).m}月${toDate(group.target).d}日`,
            rest: rest.length ? (rest.length > 1 ? `${dayLabel(rest[0])} 至 ${dayLabel(rest[rest.length - 1])}` : dayLabel(rest[0])) : '—',
            days: rest.length,
            work: group.work.sort().map(dayLabel).join('、')
          }
        })
    },
    totals() {
      const year = this.year
      const start = { y: year, m: 1, d: 1 }
      const end = { y: year, m: 12, d: 31 }
      return {
        rest: this.items.reduce((sum, item) => sum + item.days, 0),
        work: this.items.reduce((sum, item) => sum + (item.work ? item.work.split('、').length : 0), 0),
        workdays: countOfficialWorkdays(start, end)
      }
    }
  }
}
</script>

<style lang="scss">
.holidays__summary {
  margin: 0 0 10px;
}
</style>
