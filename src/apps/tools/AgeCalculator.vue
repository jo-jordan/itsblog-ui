<template>
  <div class="tool age">
    <div class="tool-form">
      <span class="tool-form__label">出生日期：</span>
      <div class="tool-inline">
        <div class="aqua-segmented" role="group" aria-label="历法">
          <button type="button" :class="{ 'is-selected': calendar === 'solar' }" :aria-pressed="calendar === 'solar' ? 'true' : 'false'" @click="setCalendar('solar')">公历</button>
          <button type="button" :class="{ 'is-selected': calendar === 'lunar' }" :aria-pressed="calendar === 'lunar' ? 'true' : 'false'" @click="setCalendar('lunar')">农历</button>
        </div>
        <input v-if="calendar === 'solar'" v-model="solarText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31" aria-label="公历出生日期">
        <lunar-date-picker v-else v-model="lunarBirth" label="出生" />
      </div>
      <label for="age-time">出生时间：</label>
      <div class="tool-inline">
        <input id="age-time" v-model="timeText" type="time" class="aqua-field" :disabled="!timeKnown">
        <label class="tool-inline">
          <input v-model="timeKnown" type="checkbox">
          <span>已知出生时间（用于时柱）</span>
        </label>
      </div>
      <label for="age-ref">计算到：</label>
      <div class="tool-inline">
        <input id="age-ref" v-model="refText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31">
        <button type="button" class="aqua-button" @click="refText = todayText">今天</button>
      </div>
    </div>

    <template v-if="result">
      <div class="tool-section">
        <h4>年龄</h4>
        <div class="age__cards">
          <div class="age__card">
            <span>周岁</span>
            <strong>{{ result.age }}</strong>
            <small>{{ result.ageDetail }}</small>
          </div>
          <div class="age__card">
            <span>虚岁</span>
            <strong>{{ result.nominal }}</strong>
            <small>按农历新年增岁</small>
          </div>
          <div class="age__card">
            <span>已出生</span>
            <strong>{{ result.days.toLocaleString('zh-CN') }}</strong>
            <small>天 · 约 {{ Math.floor(result.days / 7).toLocaleString('zh-CN') }} 周</small>
          </div>
        </div>
        <dl class="tool-results">
          <dt>出生</dt>
          <dd>{{ result.birthText }}</dd>
          <dt>生肖</dt>
          <dd>{{ result.shengxiao }}</dd>
          <dt>星座</dt>
          <dd>{{ result.xingzuo }}座</dd>
          <dt>下次公历生日</dt>
          <dd>{{ result.nextSolar }}</dd>
          <dt>下次农历生日</dt>
          <dd>{{ result.nextLunar }}</dd>
        </dl>
      </div>

      <div class="tool-section">
        <h4>生辰八字（四柱）</h4>
        <div class="tool-table__wrap">
          <table class="tool-table age__bazi">
            <thead>
              <tr><th /><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in result.bazi" :key="row.label" :class="{ 'age__bazi-main': row.main }">
                <th scope="row">{{ row.label }}</th>
                <td v-for="(cell, index) in row.cells" :key="index">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="tool-hint">四柱以立春和各节交接时刻为界；未填写出生时间时不排时柱。{{ result.timeNote }}</p>
      </div>
    </template>
    <p v-else class="tool-error">{{ error }}</p>
  </div>
</template>

<script>
import LunarDatePicker from './LunarDatePicker'
import { compare, dayNumber, formatChinese, formatYmd, nextAnniversary, parseYmd, span, today, weekday, WEEKDAYS } from './lib/dates'
import { lunarOf, lunarText, lunarToSolar, nextLunarAnniversary, Solar, MIN_YEAR, MAX_YEAR } from './lib/calendar'

function countdown(date, ref) {
  const days = dayNumber(date) - dayNumber(ref)
  return days === 0 ? '就是今天，生日快乐！' : `还有 ${days} 天`
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
        return '请输入 1900 至 2100 年之间的有效日期。'
      }
      return '出生日期不能晚于计算日期。'
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
      // 八字: the hour matters for the 时柱 and, near midnight or a 节, even for the others
      const moment = Solar.fromYmdHms(birth.y, birth.m, birth.d, time ? time.h : 12, time ? time.mi : 0, 0)
      const momentLunar = moment.getLunar()
      const ec = momentLunar.getEightChar()
      const columns = ['Year', 'Month', 'Day', 'Time']
      const row = (label, method, main) => ({
        label,
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
      return {
        age: parts.years,
        ageDetail: `${parts.years} 岁 ${parts.yearMonths} 个月 ${parts.monthsRest} 天`,
        nominal: refLunar.getYear() - birthLunar.getYear() + 1,
        days: parts.days,
        birthText: `${formatChinese(birth)}（周${WEEKDAYS[weekday(birth)]}）· 农历${lunarText(birthLunar, true)}${time ? ` · ${momentLunar.getTimeZhi()}时` : ''}`,
        shengxiao: zodiac === zodiacByLiChun ? `${zodiac}` : `${zodiac}（按农历年）；按立春划分为${zodiacByLiChun}`,
        xingzuo: moment.getXingZuo(),
        nextSolar: `${formatChinese(nextSolar)}（周${WEEKDAYS[weekday(nextSolar)]}），${countdown(nextSolar, ref)}，满 ${nextSolar.y - birth.y} 周岁`,
        nextLunar: nextLunar
          ? `${formatChinese(nextLunar)}（农历${lunarText(lunarOf(nextLunar))}），${countdown(nextLunar, ref)}`
          : '超出可计算范围',
        bazi: [
          row('干支', '', true),
          row('五行', 'WuXing'),
          row('纳音', 'NaYin'),
          row('十神', 'ShiShenGan'),
          row('藏干', 'HideGan')
        ],
        timeNote: time ? '' : '未知时辰时，年、月、日柱按当天正午排出。'
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
