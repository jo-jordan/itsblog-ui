<template>
  <div class="tool month-cal">
    <div class="tool-bar">
      <button type="button" class="aqua-button month-cal__nav" aria-label="上一年" @click="shift(-12)">«</button>
      <button type="button" class="aqua-button month-cal__nav" aria-label="上个月" @click="shift(-1)">‹</button>
      <select v-model.number="year" class="aqua-popup" aria-label="年份">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>
      <select v-model.number="month" class="aqua-popup" aria-label="月份">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
      </select>
      <button type="button" class="aqua-button month-cal__nav" aria-label="下个月" @click="shift(1)">›</button>
      <button type="button" class="aqua-button month-cal__nav" aria-label="下一年" @click="shift(12)">»</button>
      <button type="button" class="aqua-button" @click="goToday">今天</button>
      <span class="tool-bar__spacer" />
      <div class="aqua-segmented" role="group" aria-label="每周第一天">
        <button type="button" :class="{ 'is-selected': weekStart === 1 }" :aria-pressed="weekStart === 1 ? 'true' : 'false'" @click="setWeekStart(1)">周一开始</button>
        <button type="button" :class="{ 'is-selected': weekStart === 0 }" :aria-pressed="weekStart === 0 ? 'true' : 'false'" @click="setWeekStart(0)">周日开始</button>
      </div>
    </div>

    <p class="month-cal__caption">
      {{ year }}年{{ month }}月 · 农历{{ caption }}
    </p>

    <p v-if="!covered" class="tool-note">lunar-javascript 尚未收录 {{ year }} 年的法定放假安排（现有数据覆盖 {{ range[0] }}–{{ range[1] }} 年），本月不显示休/班标记。</p>

    <div class="month-cal__grid" role="grid" :aria-label="`${year}年${month}月`">
      <div class="month-cal__row" role="row">
        <div v-for="name in headers" :key="name.label" role="columnheader" class="month-cal__head" :class="{ 'is-weekend': name.weekend }">
          {{ name.label }}
        </div>
      </div>
      <div v-for="(row, index) in rows" :key="index" class="month-cal__row" role="row">
        <button
          v-for="cell in row"
          :key="cell.key"
          type="button"
          role="gridcell"
          class="month-cal__cell"
          :class="cell.classes"
          :aria-label="cell.aria"
          :title="cell.aria"
          @click="openAlmanac(cell)"
        >
          <span class="month-cal__day">{{ cell.day }}</span>
          <span class="month-cal__sub" :class="`is-${cell.kind}`">{{ cell.label }}</span>
          <span v-if="cell.badge" class="month-cal__badge" :class="cell.badge === '班' ? 'is-work' : 'is-rest'">{{ cell.badge }}</span>
        </button>
      </div>
    </div>
    <p class="tool-hint">点击任意一天即可查看当天的黄历。</p>

    <div v-if="events.length" class="tool-section">
      <h4>本月节气与假日</h4>
      <ul class="month-cal__events">
        <li v-for="event in events" :key="event.key">
          <span class="month-cal__event-date">{{ event.date }}</span>
          <span>{{ event.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { addDays, dayNumber, daysInMonth, formatYmd, isWeekend, sameDay, today, weekday, WEEKDAYS } from './lib/dates'
import { cellInfo, hasHolidayData, holidayDataRange, holidayMap, lunarOf, lunarText, MAX_YEAR, MIN_YEAR, solarTermsOf } from './lib/calendar'
import { load, save } from './lib/storage'

export default {
  name: 'ToolMonthCalendar',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const now = today()
    return {
      year: now.y,
      month: now.m,
      weekStart: load('weekStart', 1) === 0 ? 0 : 1,
      years: Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)
    }
  },
  computed: {
    headers() {
      return Array.from({ length: 7 }, (_, i) => {
        const w = (i + this.weekStart) % 7
        return { label: WEEKDAYS[w], weekend: w === 0 || w === 6 }
      })
    },
    covered() {
      return hasHolidayData(this.year)
    },
    range() {
      return holidayDataRange()
    },
    rows() {
      const first = { y: this.year, m: this.month, d: 1 }
      const lead = (weekday(first) - this.weekStart + 7) % 7
      const start = addDays(first, -lead)
      const now = today()
      const cells = []
      for (let i = 0; i < 42; i++) {
        const date = addDays(start, i)
        const info = cellInfo(date)
        const inMonth = date.m === this.month
        const badge = info.holiday ? (info.holiday.work ? '班' : '休') : ''
        cells.push({
          key: formatYmd(date),
          date,
          day: date.d,
          label: info.label,
          kind: info.kind,
          badge,
          aria: `${date.y}年${date.m}月${date.d}日 星期${WEEKDAYS[weekday(date)]} 农历${lunarText(info.lunar)}${info.kind === 'festival' || info.kind === 'term' ? ` ${info.label}` : ''}${info.holiday ? ` ${info.holiday.name}${info.holiday.work ? '调休上班' : '放假'}` : ''}`,
          classes: {
            'is-other': !inMonth,
            'is-today': sameDay(date, now),
            'is-weekend': isWeekend(date),
            'is-rest': badge === '休',
            'is-work': badge === '班'
          }
        })
      }
      const rows = []
      for (let i = 0; i < 6; i++) {
        rows.push(cells.slice(i * 7, i * 7 + 7))
      }
      // Drop a trailing row that belongs entirely to the next month
      return rows.filter(row => row.some(cell => cell.date.m === this.month))
    },
    caption() {
      const first = lunarOf({ y: this.year, m: this.month, d: 1 })
      const last = lunarOf({ y: this.year, m: this.month, d: daysInMonth(this.year, this.month) })
      const from = `${first.getYearInGanZhi()}年${lunarText(first)}`
      const to = first.getYearInGanZhi() === last.getYearInGanZhi() ? lunarText(last) : `${last.getYearInGanZhi()}年${lunarText(last)}`
      return `${from} — ${to}`
    },
    events() {
      const list = []
      solarTermsOf(this.year).forEach(term => {
        if (term.solar.getMonth() === this.month) {
          list.push({ key: `t${term.name}`, order: term.solar.getDay(), date: `${this.month}月${term.solar.getDay()}日`, text: `${term.name} ${term.solar.toYmdHms().slice(11, 16)} 交节` })
        }
      })
      // Group the arranged days of this month by holiday
      const groups = {}
      Object.values(holidayMap(this.year)).forEach(holiday => {
        const [, m, d] = holiday.day.split('-').map(Number)
        if (m !== this.month) {
          return
        }
        const key = `${holiday.name}${holiday.work ? '班' : '休'}`
        groups[key] = groups[key] || { holiday, days: [] }
        groups[key].days.push(d)
      })
      Object.keys(groups).forEach(key => {
        const { holiday, days } = groups[key]
        const text = days.length > 1 && days[days.length - 1] - days[0] === days.length - 1
          ? `${this.month}月${days[0]}日–${days[days.length - 1]}日`
          : days.map(d => `${this.month}月${d}日`).join('、')
        list.push({ key, order: days[0], date: text, text: `${holiday.name}${holiday.work ? '调休上班' : `放假（${days.length} 天在本月）`}` })
      })
      return list.sort((a, b) => a.order - b.order)
    }
  },
  watch: {
    params: {
      immediate: true,
      handler(params) {
        if (params && params.year) {
          this.year = params.year
          this.month = params.month || 1
        }
      }
    }
  },
  methods: {
    shift(months) {
      const index = this.year * 12 + this.month - 1 + months
      const year = Math.floor(index / 12)
      if (year < MIN_YEAR || year > MAX_YEAR) {
        return
      }
      this.year = year
      this.month = index - year * 12 + 1
    },
    goToday() {
      const now = today()
      this.year = now.y
      this.month = now.m
    },
    setWeekStart(value) {
      this.weekStart = value
      save('weekStart', value)
    },
    openAlmanac(cell) {
      if (dayNumber(cell.date) >= dayNumber({ y: MIN_YEAR, m: 1, d: 1 }) && cell.date.y <= MAX_YEAR) {
        this.$emit('open', { tool: 'almanac', date: formatYmd(cell.date) })
      }
    }
  }
}
</script>

<style lang="scss">
.month-cal__nav {
  width: 28px;
  padding: 0;
  font-size: 15px;
}

.month-cal__caption {
  margin: -4px 0 10px;
  font-size: 12px;
  color: #555;
}

.month-cal__grid {
  border: 1px solid #8c8c8c;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.month-cal__row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.month-cal__head {
  height: 20px;
  border-right: 1px solid #b5b5b5;
  border-bottom: 1px solid #8c8c8c;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  background: linear-gradient(to bottom, #fdfdfd, #dedede);

  &:last-child {
    border-right: 0;
  }

  &.is-weekend {
    color: #c41e14;
  }
}

.month-cal__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  min-height: 52px;
  padding: 4px 2px;
  border: 0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  font: inherit;
  color: #000;
  background: #fff;
  cursor: default;
  outline: none;

  &:nth-child(7n) {
    border-right: 0;
  }

  &:hover {
    background: #eef4fd;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(61, 128, 223, 0.7);
  }

  &.is-weekend .month-cal__day {
    color: #c41e14;
  }

  &.is-rest {
    background: #fdeeed;
  }

  &.is-work {
    background: #f1f2f4;

    .month-cal__day {
      color: #000;
    }
  }

  &.is-other {
    opacity: 0.38;
  }

  &.is-today {
    color: #fff;
    background: linear-gradient(to bottom, var(--aqua-highlight-top), var(--aqua-highlight) 50%, var(--aqua-highlight-bottom));

    .month-cal__day,
    .month-cal__sub {
      color: #fff !important;
    }
  }
}

.month-cal__day {
  font-size: 17px;
  line-height: 1.1;
}

.month-cal__sub {
  max-width: 100%;
  overflow: hidden;
  font-size: 11px;
  color: #666;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-festival {
    color: #c41e14;
  }

  &.is-term {
    color: #1a7f2b;
  }

  &.is-month {
    font-weight: bold;
    color: #8a5a00;
  }
}

.month-cal__badge {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 15px;
  height: 15px;
  border-radius: 3px;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  color: #fff;

  &.is-rest {
    background: #d8261b;
  }

  &.is-work {
    background: #5c6676;
  }
}

.month-cal__events {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12px;

  li {
    display: flex;
    gap: 12px;
    padding: 2px 0;
  }
}

.month-cal__event-date {
  min-width: 120px;
  color: #555;
}

@media (max-width: 767px) {
  .month-cal__cell {
    min-height: 44px;
  }

  .month-cal__day {
    font-size: 15px;
  }

  .month-cal__sub {
    font-size: 10px;
  }
}
</style>
