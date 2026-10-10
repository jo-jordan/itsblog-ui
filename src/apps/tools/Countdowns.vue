<template>
  <div class="tool countdowns">
    <ul v-if="entries.length" class="countdowns__list">
      <li v-for="entry in entries" :key="entry.id" class="countdowns__item" :class="{ 'is-past': entry.past, 'is-today': entry.days === 0 }">
        <div class="countdowns__badge">
          <small>{{ entry.days === 0 ? '' : $t(entry.past ? 'tools.countdowns.badgePast' : 'tools.countdowns.badgeAhead') }}</small>
          <strong>{{ entry.days === 0 ? $t('tools.common.today') : Math.abs(entry.days) }}</strong>
          <small>{{ entry.days === 0 ? '' : $tc(entry.past ? 'tools.countdowns.badgeDaysPast' : 'tools.countdowns.badgeDays', Math.abs(entry.days)) }}</small>
        </div>
        <div class="countdowns__text">
          <strong>{{ entry.name }}</strong>
          <span>{{ entry.rule }}</span>
          <span class="tool-muted">{{ entry.detail }}</span>
        </div>
        <button type="button" class="aqua-button countdowns__delete" :aria-label="$t('tools.countdowns.deleteNamed', { name: entry.name })" @click="remove(entry.id)">{{ $t('tools.common.delete') }}</button>
      </li>
    </ul>
    <p v-else class="countdowns__empty">{{ $t('tools.countdowns.empty') }}</p>

    <form class="aqua-group countdowns__form" @submit.prevent="add">
      <div class="tool-form">
        <label for="countdown-name">{{ $t('tools.countdowns.name') }}</label>
        <input id="countdown-name" v-model.trim="draft.name" type="text" class="aqua-field" maxlength="40" :placeholder="$t('tools.countdowns.namePlaceholder')">
        <span class="tool-form__label">{{ $t('tools.countdowns.calendar') }}</span>
        <div class="aqua-segmented" role="group" :aria-label="$t('tools.countdowns.calendarLabel')">
          <button type="button" :class="{ 'is-selected': draft.calendar === 'solar' }" :aria-pressed="draft.calendar === 'solar' ? 'true' : 'false'" @click="draft.calendar = 'solar'">{{ $t('tools.countdowns.solar') }}</button>
          <button type="button" :class="{ 'is-selected': draft.calendar === 'lunar' }" :aria-pressed="draft.calendar === 'lunar' ? 'true' : 'false'" @click="draft.calendar = 'lunar'">{{ $t('tools.common.lunar') }}</button>
        </div>
        <span class="tool-form__label">{{ $t('tools.countdowns.date') }}</span>
        <div>
          <input v-if="draft.calendar === 'solar'" v-model="draft.date" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31" :aria-label="$t('tools.countdowns.solarDate')">
          <lunar-date-picker v-else v-model="draft.lunar" />
        </div>
        <span />
        <label class="tool-inline">
          <input v-model="draft.repeat" type="checkbox">
          <span>{{ $t(draft.calendar === 'lunar' ? 'tools.countdowns.repeatLunar' : 'tools.countdowns.repeat') }}</span>
        </label>
        <span />
        <div class="tool-inline">
          <button type="submit" class="aqua-button aqua-button--default" :disabled="!canAdd">{{ $t('tools.common.add') }}</button>
          <span v-if="draftError" class="tool-bad">{{ draftError }}</span>
        </div>
      </div>
    </form>
    <p class="tool-hint">{{ $t('tools.countdowns.hint') }}</p>
  </div>
</template>

<script>
import LunarDatePicker from './LunarDatePicker.vue'
import { dayNumber, formatYmd, nextAnniversary, parseYmd, today, weekday } from './lib/dates'
import { lunarDateText, lunarOf, lunarText, lunarToSolar, nextLunarAnniversary, Lunar } from './lib/calendar'
import { formatLongDate, formatMonthDay, t, tc, weekdayName } from './lib/i18n'
import { load, save } from './lib/storage'

const STORAGE_KEY = 'countdowns'

// A few festivals to start with, each anchored on its next occurrence and named
// in the current language
function defaults() {
  const now = today()
  const lunarYear = (m, d) => lunarOf(nextLunarAnniversary(m, d, now)).getYear()
  const solarDate = (m, d) => formatYmd(nextAnniversary(m, d, now))
  return [
    { id: 1, name: t('tools.countdowns.defaults.springFestival'), calendar: 'lunar', lunar: { y: lunarYear(1, 1), m: 1, d: 1 }, repeat: true },
    { id: 2, name: t('tools.countdowns.defaults.midAutumn'), calendar: 'lunar', lunar: { y: lunarYear(8, 15), m: 8, d: 15 }, repeat: true },
    { id: 3, name: t('tools.countdowns.defaults.newYear'), calendar: 'solar', date: solarDate(1, 1), repeat: true },
    { id: 4, name: t('tools.countdowns.defaults.christmas'), calendar: 'solar', date: solarDate(12, 25), repeat: true }
  ]
}

function lunarName(lunar, withYear) {
  const date = Lunar.fromYmd(lunar.y, lunar.m, lunar.d)
  return withYear ? t('tools.countdowns.lunarDateYear', { y: lunar.y, text: lunarText(date) }) : lunarDateText(date)
}

function dateLine(date) {
  return t('tools.countdowns.dateWeekday', { date: formatLongDate(date), weekday: weekdayName(weekday(date)) })
}

export default {
  name: 'ToolCountdowns',
  components: { LunarDatePicker },
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const stored = load(STORAGE_KEY, null)
    const now = lunarOf(today())
    return {
      // null until the list is first changed: the starting festivals are not stored
      stored: Array.isArray(stored) ? stored : null,
      draft: {
        name: '',
        calendar: 'solar',
        date: formatYmd(today()),
        lunar: { y: now.getYear(), m: now.getMonth(), d: now.getDay() },
        repeat: true
      }
    }
  },
  computed: {
    items() {
      return this.stored || defaults()
    },
    entries() {
      const now = today()
      const todayNumber = dayNumber(now)
      return this.items
        .map(item => this.evaluate(item, now, todayNumber))
        .filter(Boolean)
        .sort((a, b) => {
          // Upcoming first (nearest on top), then past dates, most recent first
          if (a.past !== b.past) {
            return a.past ? 1 : -1
          }
          return Math.abs(a.days) - Math.abs(b.days)
        })
    },
    draftError() {
      if (this.draft.calendar === 'solar' && !parseYmd(this.draft.date)) {
        return t('tools.countdowns.chooseDate')
      }
      return ''
    },
    canAdd() {
      return Boolean(this.draft.name) && !this.draftError
    }
  },
  methods: {
    evaluate(item, now, todayNumber) {
      const lunar = item.calendar === 'lunar'
      const origin = lunar ? lunarToSolar(item.lunar.y, item.lunar.m, item.lunar.d) : parseYmd(item.date)
      if (!origin) {
        return null
      }
      const since = todayNumber - dayNumber(origin)
      if (!item.repeat) {
        return {
          id: item.id,
          name: item.name,
          days: dayNumber(origin) - todayNumber,
          past: since > 0,
          rule: lunar ? `${lunarName(item.lunar, true)} · ${formatLongDate(origin)}` : dateLine(origin),
          detail: since > 0 ? tc('tools.countdowns.elapsed', since) : ''
        }
      }
      const next = lunar ? nextLunarAnniversary(item.lunar.m, item.lunar.d, now) : nextAnniversary(origin.m, origin.d, now)
      if (!next) {
        return null
      }
      const years = lunar ? lunarOf(next).getYear() - item.lunar.y : next.y - origin.y
      return {
        id: item.id,
        name: item.name,
        days: dayNumber(next) - todayNumber,
        past: false,
        rule: t('tools.countdowns.yearly', { date: lunar ? lunarName(item.lunar, false) : formatMonthDay(origin), next: dateLine(next) }),
        detail: since > 0 && years > 0 ? t('tools.countdowns.since', { date: formatLongDate(origin), years, days: tc('tools.common.days', since) }) : ''
      }
    },
    persist(items) {
      this.stored = items
      save(STORAGE_KEY, items)
    },
    add() {
      if (!this.canAdd) {
        return
      }
      const { name, calendar, date, lunar, repeat } = this.draft
      const id = this.items.reduce((max, item) => Math.max(max, item.id), 0) + 1
      const item = calendar === 'solar' ? { id, name, calendar, date, repeat } : { id, name, calendar, lunar: { ...lunar }, repeat }
      this.draft.name = ''
      this.persist([...this.items, item])
    },
    remove(id) {
      this.persist(this.items.filter(item => item.id !== id))
    }
  }
}
</script>

<style lang="scss">
.countdowns__list {
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
  border: 1px solid #8c8c8c;
}

.countdowns__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-bottom: 1px solid #e3e3e3;

  &:last-child {
    border-bottom: 0;
  }

  &:nth-child(even) {
    background: #edf3fe;
  }
}

// Gel badge with the number of days
.countdowns__badge {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  height: 52px;
  padding: 0 4px;
  border: 1px solid var(--aqua-gel-border);
  border-radius: 8px;
  color: #0b2c5c;
  background: linear-gradient(to bottom, var(--aqua-gel-top) 0%, #9fcbf8 45%, var(--aqua-gel-mid) 50%, #7fbcf6 80%, var(--aqua-gel-bottom) 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.7);

  strong {
    font-size: 20px;
    line-height: 1.1;
  }

  small {
    font-size: 10px;
    white-space: nowrap;
  }

  .is-past & {
    border-color: #7a7a7a;
    color: #333;
    background: linear-gradient(to bottom, #fdfdfd 0%, #e9e9e9 45%, #d0d0d0 50%, #e4e4e4 85%, #f4f4f4 100%);
  }

  .is-today & {
    border-color: #9c120c;
    color: #fff;
    background: linear-gradient(to bottom, #f6877c 0%, #e0453a 45%, #c41e14 50%, #e0453a 100%);
  }
}

.countdowns__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 12px;

  strong {
    font-size: 14px;
  }
}

.countdowns__delete {
  min-width: 0;
  font-size: 11px;
}

.countdowns__empty {
  padding: 20px;
  text-align: center;
  color: #888;
}
</style>
