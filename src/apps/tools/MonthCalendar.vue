<template>
  <div class="tool month-cal">
    <div class="tool-bar">
      <button type="button" class="aqua-button month-cal__nav" :aria-label="$t('tools.calendar.previousYear')" @click="shift(-12)">«</button>
      <button type="button" class="aqua-button month-cal__nav" :aria-label="$t('tools.monthCalendar.previousMonth')" @click="shift(-1)">‹</button>
      <select v-model.number="year" class="aqua-popup" :aria-label="$t('tools.monthCalendar.year')">
        <option v-for="y in years" :key="y" :value="y">{{ $t('tools.calendar.yearOption', { y }) }}</option>
      </select>
      <select v-model.number="month" class="aqua-popup" :aria-label="$t('tools.monthCalendar.month')">
        <option v-for="m in 12" :key="m" :value="m">{{ $t('tools.monthCalendar.months')[m - 1] }}</option>
      </select>
      <button type="button" class="aqua-button month-cal__nav" :aria-label="$t('tools.monthCalendar.nextMonth')" @click="shift(1)">›</button>
      <button type="button" class="aqua-button month-cal__nav" :aria-label="$t('tools.calendar.nextYear')" @click="shift(12)">»</button>
      <button type="button" class="aqua-button" @click="goToday">{{ $t('tools.common.today') }}</button>
      <span class="tool-bar__spacer" />
      <div class="aqua-segmented" role="group" :aria-label="$t('tools.monthCalendar.weekStart')">
        <button type="button" :class="{ 'is-selected': weekStart === 1 }" :aria-pressed="weekStart === 1 ? 'true' : 'false'" @click="setWeekStart(1)">{{ $t('tools.monthCalendar.mondayFirst') }}</button>
        <button type="button" :class="{ 'is-selected': weekStart === 0 }" :aria-pressed="weekStart === 0 ? 'true' : 'false'" @click="setWeekStart(0)">{{ $t('tools.monthCalendar.sundayFirst') }}</button>
      </div>
    </div>

    <p class="month-cal__caption">
      {{ $t('tools.monthCalendar.caption', { date: title, lunar: caption }) }}
    </p>

    <p v-if="!covered" class="tool-note">{{ $t('tools.monthCalendar.uncovered', { year, first: range[0], last: range[1] }) }}</p>

    <div class="month-cal__grid" role="grid" :aria-label="title">
      <div class="month-cal__row" role="row">
        <div v-for="name in headers" :key="name.weekday" role="columnheader" class="month-cal__head" :class="{ 'is-weekend': name.weekend }">
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
          <span v-if="cell.holiday" class="month-cal__badge" :class="cell.holiday.work ? 'is-work' : 'is-rest'">{{ cell.badge }}</span>
        </button>
      </div>
    </div>
    <p class="tool-hint">{{ $t('tools.monthCalendar.hint') }}</p>

    <div v-if="events.length" class="tool-section">
      <h4>{{ $t('tools.monthCalendar.events') }}</h4>
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
import { addDays, dayNumber, daysInMonth, formatYmd, isWeekend, sameDay, today, weekday } from './lib/dates'
import {
  cellInfo, hasHolidayData, holidayBadge, holidayDataRange, holidayMap, holidayName, holidayStatus,
  lunarDateText, lunarOf, lunarText, MAX_YEAR, MIN_YEAR, solarTermsOf, termName
} from './lib/calendar'
import { formatLongDate, formatMonthDay, formatYearMonth, t, tc, weekdayName } from './lib/i18n'
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
        return { weekday: w, label: weekdayName(w, t('tools.monthCalendar.headerStyle')), weekend: w === 0 || w === 6 }
      })
    },
    title() {
      return formatYearMonth({ y: this.year, m: this.month })
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
        const named = info.kind === 'festival' || info.kind === 'term'
        cells.push({
          key: formatYmd(date),
          date,
          day: date.d,
          label: info.label,
          kind: info.kind,
          holiday: info.holiday,
          badge: info.holiday ? holidayBadge(info.holiday) : '',
          aria: [
            formatLongDate(date),
            weekdayName(weekday(date), 'long'),
            lunarDateText(info.lunar),
            named && info.label,
            info.holiday && holidayStatus(info.holiday)
          ].filter(Boolean).join(t('tools.monthCalendar.ariaSeparator')),
          classes: {
            'is-other': !inMonth,
            'is-today': sameDay(date, now),
            'is-weekend': isWeekend(date),
            'is-rest': Boolean(info.holiday) && !info.holiday.work,
            'is-work': Boolean(info.holiday) && info.holiday.work
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
      const withYear = lunar => t('tools.monthCalendar.captionYear', { year: lunar.getYearInGanZhi(), text: lunarText(lunar) })
      const to = first.getYearInGanZhi() === last.getYearInGanZhi() ? lunarText(last) : withYear(last)
      return `${withYear(first)} — ${to}`
    },
    events() {
      const list = []
      const monthDay = d => formatMonthDay({ y: this.year, m: this.month, d })
      solarTermsOf(this.year).forEach(term => {
        if (term.solar.getMonth() === this.month) {
          list.push({
            key: `t${term.name}`,
            order: term.solar.getDay(),
            date: monthDay(term.solar.getDay()),
            text: t('tools.monthCalendar.termEvent', { name: termName(term.name), time: term.solar.toYmdHms().slice(11, 16) })
          })
        }
      })
      // Group the arranged days of this month by holiday
      const groups = {}
      Object.values(holidayMap(this.year)).forEach(holiday => {
        const [, m, d] = holiday.day.split('-').map(Number)
        if (m !== this.month) {
          return
        }
        const key = `${holiday.name}${holiday.work ? '-work' : '-rest'}`
        groups[key] = groups[key] || { holiday, days: [] }
        groups[key].days.push(d)
      })
      Object.keys(groups).forEach(key => {
        const { holiday, days } = groups[key]
        const text = days.length > 1 && days[days.length - 1] - days[0] === days.length - 1
          ? t('tools.monthCalendar.dayRange', { from: monthDay(days[0]), to: days[days.length - 1] })
          : days.map(monthDay).join(t('tools.calendar.listSeparator'))
        list.push({
          key,
          order: days[0],
          date: text,
          text: holiday.work ? holidayStatus(holiday) : tc('tools.monthCalendar.restEvent', days.length, { name: holidayName(holiday.name) })
        })
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

// "Off" and "Work" need more room than 休 and 班
.month-cal__badge:lang(en) {
  top: 2px;
  right: 2px;
  width: auto;
  height: 12px;
  padding: 0 3px;
  font-size: 9px;
  line-height: 12px;
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
