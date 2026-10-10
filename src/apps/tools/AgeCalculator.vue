<template>
  <div class="tool age">
    <div class="tool-form">
      <span class="tool-form__label">{{ $t('tools.ageCalculator.birthDate') }}</span>
      <div class="tool-inline">
        <div class="aqua-segmented" role="group" :aria-label="$t('tools.ageCalculator.calendarLabel')">
          <button type="button" :class="{ 'is-selected': calendar === 'solar' }" :aria-pressed="calendar === 'solar' ? 'true' : 'false'" @click="setCalendar('solar')">{{ $t('tools.ageCalculator.solar') }}</button>
          <button type="button" :class="{ 'is-selected': calendar === 'lunar' }" :aria-pressed="calendar === 'lunar' ? 'true' : 'false'" @click="setCalendar('lunar')">{{ $t('tools.common.lunar') }}</button>
        </div>
        <input v-if="calendar === 'solar'" v-model="solarText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31" :aria-label="$t('tools.ageCalculator.solarBirthDate')">
        <lunar-date-picker v-else v-model="lunarBirth" :label="$t('tools.ageCalculator.pickerLabel')" />
      </div>
      <label for="age-time">{{ $t('tools.ageCalculator.birthTime') }}</label>
      <div class="tool-inline">
        <input id="age-time" v-model="timeText" type="time" class="aqua-field" :disabled="!timeKnown">
        <label class="tool-inline">
          <input v-model="timeKnown" type="checkbox">
          <span>{{ $t('tools.ageCalculator.timeKnown') }}</span>
        </label>
      </div>
      <label for="age-ref">{{ $t('tools.ageCalculator.asOf') }}</label>
      <div class="tool-inline">
        <input id="age-ref" v-model="refText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31">
        <button type="button" class="aqua-button" @click="refText = todayText">{{ $t('tools.common.today') }}</button>
      </div>
    </div>

    <template v-if="result">
      <div class="tool-section">
        <h4>{{ $t('tools.ageCalculator.age') }}</h4>
        <div class="age__cards">
          <div class="age__card">
            <span>{{ $t('tools.ageCalculator.fullAge') }}</span>
            <strong>{{ result.age }}</strong>
            <small>{{ result.ageDetail }}</small>
          </div>
          <div class="age__card">
            <span>{{ $t('tools.ageCalculator.nominalAge') }}</span>
            <strong>{{ result.nominal }}</strong>
            <small>{{ $t('tools.ageCalculator.nominalHint') }}</small>
          </div>
          <div class="age__card">
            <span>{{ $t('tools.ageCalculator.lived') }}</span>
            <strong>{{ result.daysText }}</strong>
            <small>{{ result.weeksText }}</small>
          </div>
        </div>
        <dl class="tool-results">
          <dt>{{ $t('tools.ageCalculator.born') }}</dt>
          <dd>{{ result.birthText }}</dd>
          <dt>{{ $t('tools.ageCalculator.animal') }}</dt>
          <dd>{{ result.shengxiao }}</dd>
          <dt>{{ $t('tools.ageCalculator.sign') }}</dt>
          <dd>{{ result.xingzuo }}</dd>
          <dt>{{ $t('tools.ageCalculator.nextSolar') }}</dt>
          <dd>{{ result.nextSolar }}</dd>
          <dt>{{ $t('tools.ageCalculator.nextLunar') }}</dt>
          <dd>{{ result.nextLunar }}</dd>
        </dl>
      </div>

      <div class="tool-section">
        <h4>{{ $t('tools.ageCalculator.bazi') }}</h4>
        <div class="tool-table__wrap">
          <table class="tool-table age__bazi">
            <thead>
              <tr><th /><th v-for="pillar in $t('tools.ageCalculator.pillars')" :key="pillar">{{ pillar }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in result.bazi" :key="row.id" :class="{ 'age__bazi-main': row.main }">
                <th scope="row">{{ row.label }}</th>
                <td v-for="(cell, index) in row.cells" :key="index">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="tool-hint">{{ $t(result.timed ? 'tools.ageCalculator.baziHint' : 'tools.ageCalculator.baziHintNoTime') }}</p>
      </div>
    </template>
    <p v-else class="tool-error">{{ error }}</p>
  </div>
</template>

<script>
import LunarDatePicker from './LunarDatePicker'
import { compare, dayNumber, formatYmd, nextAnniversary, parseYmd, span, today, weekday } from './lib/dates'
import { lunarDateText, lunarOf, lunarToSolar, nextLunarAnniversary, signName, zodiacName, Solar, MIN_YEAR, MAX_YEAR } from './lib/calendar'
import { formatLongDate, formatNumber, t, tc, weekdayName } from './lib/i18n'

function countdown(date, ref) {
  const days = dayNumber(date) - dayNumber(ref)
  return days === 0 ? t('tools.ageCalculator.birthdayToday') : tc('tools.ageCalculator.birthdayIn', days)
}

function dateLine(date) {
  return t('tools.ageCalculator.dateWeekday', { date: formatLongDate(date), weekday: weekdayName(weekday(date)) })
}

export default {
  name: 'ToolAgeCalculator',
  components: { LunarDatePicker },
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      todayText: formatYmd(today()),
      calendar: 'solar',
      solarText: '1990-06-15',
      lunarBirth: { y: 1990, m: 5, d: 23 },
      timeText: '08:30',
      timeKnown: true,
      refText: formatYmd(today())
    }
  },
  computed: {
    birth() {
      if (this.calendar === 'lunar') {
        return lunarToSolar(this.lunarBirth.y, this.lunarBirth.m, this.lunarBirth.d)
      }
      const date = parseYmd(this.solarText)
      return date && date.y >= MIN_YEAR && date.y <= MAX_YEAR ? date : null
    },
    ref() {
      const date = parseYmd(this.refText)
      return date && date.y >= MIN_YEAR && date.y <= MAX_YEAR ? date : null
    },
    time() {
      const match = /^(\d{2}):(\d{2})/.exec(this.timeText || '')
      return this.timeKnown && match ? { h: +match[1], mi: +match[2] } : null
    },
    error() {
      if (!this.birth || !this.ref) {
        return t('tools.ageCalculator.invalidDates')
      }
      return t('tools.ageCalculator.bornAfter')
    },
    result() {
      const { birth, ref, time } = this
      if (!birth || !ref || compare(birth, ref) > 0) {
        return null
      }
      const parts = span(birth, ref)
      const birthLunar = lunarOf(birth)
      const refLunar = lunarOf(ref)
      const nextSolar = nextAnniversary(birth.m, birth.d, ref)
      const nextLunar = nextLunarAnniversary(birthLunar.getMonth(), birthLunar.getDay(), ref)
      // Four Pillars (八字): the hour matters for the hour pillar (时柱) and, near
      // midnight or a solar term (节), even for the others
      const moment = Solar.fromYmdHms(birth.y, birth.m, birth.d, time ? time.h : 12, time ? time.mi : 0, 0)
      const momentLunar = moment.getLunar()
      const ec = momentLunar.getEightChar()
      const columns = ['Year', 'Month', 'Day', 'Time']
      const row = (id, method, main) => ({
        id,
        label: t(`tools.ageCalculator.rows.${id}`),
        main,
        cells: columns.map(part => {
          if (part === 'Time' && !time) {
            return '—'
          }
          const value = ec[`get${part}${method}`]()
          return Array.isArray(value) ? value.join(' ') : value
        })
      })
      const zodiac = birthLunar.getYearShengXiao()
      const zodiacByLiChun = momentLunar.getYearShengXiaoByLiChun()
      const lunarBirthText = lunarDateText(birthLunar, true)
      return {
        age: parts.years,
        ageDetail: t('tools.ageCalculator.ageDetail', {
          years: tc('tools.ageCalculator.ageYears', parts.years),
          months: tc('tools.common.months', parts.yearMonths),
          days: tc('tools.common.days', parts.monthsRest)
        }),
        nominal: refLunar.getYear() - birthLunar.getYear() + 1,
        daysText: formatNumber(parts.days),
        weeksText: tc('tools.ageCalculator.livedDetail', Math.floor(parts.days / 7), { n: formatNumber(Math.floor(parts.days / 7)) }),
        birthText: time
          ? t('tools.ageCalculator.bornAt', { date: dateLine(birth), lunar: lunarBirthText, zhi: momentLunar.getTimeZhi() })
          : t('tools.ageCalculator.bornOn', { date: dateLine(birth), lunar: lunarBirthText }),
        shengxiao: zodiac === zodiacByLiChun
          ? zodiacName(zodiac)
          : t('tools.ageCalculator.animalByLiChun', { animal: zodiacName(zodiac), other: zodiacName(zodiacByLiChun) }),
        xingzuo: t('tools.ageCalculator.signName', { name: signName(moment.getXingZuo()) }),
        nextSolar: t('tools.ageCalculator.nextSolarValue', { date: dateLine(nextSolar), countdown: countdown(nextSolar, ref), age: nextSolar.y - birth.y }),
        nextLunar: nextLunar
          ? t('tools.ageCalculator.nextLunarValue', { date: formatLongDate(nextLunar), lunar: lunarDateText(lunarOf(nextLunar)), countdown: countdown(nextLunar, ref) })
          : t('tools.ageCalculator.beyondRange'),
        bazi: [
          row('ganZhi', '', true),
          row('wuXing', 'WuXing'),
          row('naYin', 'NaYin'),
          row('shiShen', 'ShiShenGan'),
          row('hideGan', 'HideGan')
        ],
        timed: Boolean(time)
      }
    }
  },
  methods: {
    // Switching keeps the same birthday, converted to the other calendar
    setCalendar(calendar) {
      if (calendar === this.calendar) {
        return
      }
      const birth = this.birth
      if (birth && calendar === 'lunar') {
        const lunar = lunarOf(birth)
        this.lunarBirth = { y: lunar.getYear(), m: lunar.getMonth(), d: lunar.getDay() }
      } else if (birth) {
        this.solarText = formatYmd(birth)
      }
      this.calendar = calendar
    }
  }
}
</script>

<style lang="scss">
.age__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.age__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  padding: 8px 14px;
  border: 1px solid #b4b4b4;
  border-radius: 6px;
  background: linear-gradient(to bottom, #fff, #eef2f7);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);

  span {
    font-size: 11px;
    color: #555;
  }

  strong {
    font-size: 30px;
    line-height: 1.15;
    color: #1d4f9c;
  }

  small {
    font-size: 11px;
    color: #666;
  }
}

.age__bazi {
  text-align: center;

  tbody th {
    width: 56px;
    white-space: nowrap;
    border-bottom: 0;
    background: #f3f3f3;
    font-weight: normal;
    color: #555;
  }

  td {
    text-align: center;
  }
}

.age__bazi-main td {
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 20px;
  font-weight: bold;
  color: #8a1a12;
}
</style>
