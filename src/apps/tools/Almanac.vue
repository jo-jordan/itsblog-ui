<template>
  <div class="tool almanac">
    <div class="tool-bar">
      <button type="button" class="aqua-button" :aria-label="$t('tools.almanac.previousDay')" @click="move(-1)">◀ {{ $t('tools.almanac.previousDay') }}</button>
      <input v-model="dateText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31" :aria-label="$t('tools.almanac.date')">
      <button type="button" class="aqua-button" :aria-label="$t('tools.almanac.nextDay')" @click="move(1)">{{ $t('tools.almanac.nextDay') }} ▶</button>
      <span class="tool-bar__spacer" />
      <button type="button" class="aqua-button" @click="goToday">{{ $t('tools.common.today') }}</button>
    </div>

    <article v-if="info" class="almanac__page">
      <header class="almanac__masthead">
        <span>{{ info.yearMonth }}</span>
        <strong>{{ info.yearLabel }}</strong>
        <span>{{ info.week }}</span>
      </header>

      <div class="almanac__hero">
        <div class="almanac__side almanac__side--left">
          <p class="almanac__lunar-big">{{ info.lunarMonth }}<br>{{ info.lunarDay }}</p>
        </div>
        <div class="almanac__day-wrap">
          <div class="almanac__day" :class="{ 'is-weekend': info.weekend }">{{ date.d }}</div>
          <p class="almanac__festivals">
            <span v-for="name in info.festivals" :key="name" class="almanac__festival">{{ name }}</span>
            <span v-if="info.holiday" class="almanac__badge" :class="info.holiday.work ? 'is-work' : 'is-rest'">
              {{ info.holidayBadge }}
            </span>
            <span v-if="info.holiday" class="almanac__holiday">{{ info.holidayStatus }}</span>
          </p>
        </div>
        <div class="almanac__side almanac__side--right">
          <p>{{ $t('tools.almanac.ganzhiYear', { name: info.ganzhi.year }) }}</p>
          <p>{{ $t('tools.almanac.ganzhiMonth', { name: info.ganzhi.month }) }}</p>
          <p>{{ $t('tools.almanac.ganzhiDay', { name: info.ganzhi.day }) }}</p>
        </div>
      </div>

      <div class="almanac__yiji">
        <div class="almanac__yi">
          <span class="almanac__stamp">{{ $t('tools.almanac.yi') }}</span>
          <p>{{ info.yi }}</p>
        </div>
        <div class="almanac__ji">
          <span class="almanac__stamp almanac__stamp--ji">{{ $t('tools.almanac.ji') }}</span>
          <p>{{ info.ji }}</p>
        </div>
      </div>

      <dl class="almanac__grid">
        <div>
          <dt>{{ $t('tools.almanac.zodiacSign') }}</dt>
          <dd>{{ $t('tools.almanac.zodiacSignValue', { zodiac: info.shengxiao, sign: info.xingzuo }) }}</dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.term') }}</dt>
          <dd>
            <template v-if="info.termToday">{{ $t('tools.almanac.termToday', { name: info.termToday }) }}</template>
            <template v-else>{{ $t('tools.almanac.termDay', { name: info.prevTerm.name, days: info.prevTerm.days }) }}</template>
            <small>{{ $t('tools.almanac.nextTerm', { name: info.nextTerm.name, when: info.nextTerm.when, countdown: termCountdown }) }}</small>
          </dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.chongSha') }}</dt>
          <dd>{{ info.chongSha }}</dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.tianShen') }}</dt>
          <dd>{{ info.tianShen }} <span :class="info.tianShenGood ? 'tool-good' : 'tool-bad'">{{ info.tianShenType }}</span></dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.zhiXing') }}</dt>
          <dd>{{ $t('tools.almanac.zhiXingValue', { name: info.zhiXing }) }}</dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.xiu') }}</dt>
          <dd>
            {{ info.xiu }} <span :class="info.xiuGood ? 'tool-good' : 'tool-bad'">{{ info.xiuLuck }}</span>
            <small>{{ info.gong }}</small>
          </dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.nayin') }}</dt>
          <dd>{{ info.nayin }}</dd>
        </div>
        <div>
          <dt>{{ $t('tools.almanac.tai') }}</dt>
          <dd>{{ info.tai }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>{{ $t('tools.almanac.pengzu') }}</dt>
          <dd>{{ info.pengzu }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>{{ $t('tools.almanac.positions') }}</dt>
          <dd>{{ $t('tools.almanac.positionsValue', info.positions) }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>{{ $t('tools.almanac.jiShen') }}</dt>
          <dd class="tool-good">{{ info.jiShen.join(' ') || $t('tools.calendar.none') }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>{{ $t('tools.almanac.xiongSha') }}</dt>
          <dd class="tool-bad">{{ info.xiongSha.join(' ') || $t('tools.calendar.none') }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>{{ $t('tools.almanac.wuhouMoon') }}</dt>
          <dd>{{ $t('tools.almanac.wuhouMoonValue', { wuhou: info.wuhou, moon: info.yuexiang }) }}<template v-if="info.extra"> · {{ info.extra }}</template></dd>
        </div>
      </dl>

      <section class="almanac__hours">
        <h4>{{ $t('tools.almanac.hours') }}</h4>
        <div class="tool-table__wrap">
          <table class="tool-table">
            <thead>
              <tr>
                <th v-for="(name, index) in $tm('tools.almanac.hourColumns')" :key="index">{{ name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hour in hours" :key="hour.key" :class="{ 'is-selected': hour.current }">
                <td class="almanac__nowrap">{{ hour.name }}</td>
                <td class="almanac__nowrap">{{ hour.range }}</td>
                <td>{{ hour.ganzhi }}</td>
                <td class="almanac__nowrap">{{ hour.tianShen }}</td>
                <td><span class="almanac__luck" :class="hour.good ? 'is-good' : 'is-bad'">{{ hour.luck }}</span></td>
                <td class="almanac__nowrap">{{ hour.chongSha }}</td>
                <td>{{ hour.yi }}</td>
                <td>{{ hour.ji }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
    <p v-else class="tool-error">{{ $t('tools.almanac.outOfRange') }}</p>
  </div>
</template>

<script>
import { addDays, dayNumber, formatYmd, parseYmd, sameDay, today, isWeekend, pad } from './lib/dates'
import {
  beijingEpoch, directionName, festivalName, holidayBadge, holidayOf, holidayStatus, isLucky,
  lunarDayName, lunarOf, lunarMonthName, signName, termName, zodiacName
} from './lib/calendar'
import { formatMonthDay, formatYearMonth, t, tc, tm, weekdayName } from './lib/i18n'

// A name the library gives in Chinese, in English where the locale has a table for it
function translated(map, name) {
  const names = tm(`tools.almanac.${map}`)
  return (names && typeof names === 'object' && names[name]) || name
}

// The library's "(丙辰)龙" and 煞 direction → "冲龙（丙辰） 煞北"
function chongShaText(desc, sha) {
  const match = /^\((.+)\)(.+)$/.exec(desc)
  const chong = match ? t('tools.almanac.chong', { animal: zodiacName(match[2]), ganzhi: match[1] }) : desc
  return t('tools.almanac.chongShaValue', { chong, sha: directionName(sha) })
}

// 宜 / 忌 items stay in Chinese, apart from the library's two ways of saying "none"
function itemsText(items) {
  return items.map(item => translated('items', item)).join(' ')
}

function solarDate(solar) {
  return { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay() }
}

export default {
  name: 'ToolAlmanac',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      dateText: formatYmd(today()),
      now: Date.now(),
      timer: null
    }
  },
  computed: {
    date() {
      const date = parseYmd(this.dateText)
      return date && date.y >= 1900 && date.y <= 2100 ? date : null
    },
    isToday() {
      return Boolean(this.date) && sameDay(this.date, today())
    },
    lunar() {
      return this.date ? lunarOf(this.date) : null
    },
    info() {
      const lunar = this.lunar
      if (!lunar) {
        return null
      }
      const solar = lunar.getSolar()
      const prev = lunar.getPrevJieQi(true)
      const next = lunar.getNextJieQi(true)
      const nextSolar = next.getSolar()
      const fu = lunar.getFu()
      const shuJiu = lunar.getShuJiu()
      const festivals = [
        ...solar.getFestivals(),
        ...lunar.getFestivals(),
        ...lunar.getOtherFestivals(),
        ...solar.getOtherFestivals()
      ]
      const holiday = holidayOf(this.date)
      const tianShenGood = isLucky(lunar.getDayTianShenLuck())
      const xiuGood = isLucky(lunar.getXiuLuck())
      return {
        yearMonth: formatYearMonth(this.date),
        yearLabel: t('tools.almanac.yearLabel', { ganzhi: lunar.getYearInGanZhi(), zodiac: zodiacName(lunar.getYearShengXiao()) }),
        week: weekdayName(solar.getWeek(), 'long'),
        weekend: isWeekend(this.date),
        lunarMonth: lunarMonthName(lunar),
        lunarDay: t('tools.almanac.lunarDay', { name: lunarDayName(lunar.getDay()), d: lunar.getDay() }),
        festivals: [...new Set(festivals)].map(festivalName),
        holiday,
        holidayBadge: holiday ? holidayBadge(holiday) : '',
        holidayStatus: holiday ? holidayStatus(holiday) : '',
        ganzhi: {
          // The year changes at 立春 and the month at each 节, as the 干支 calendar does
          year: lunar.getYearInGanZhiByLiChun(),
          month: lunar.getMonthInGanZhi(),
          day: lunar.getDayInGanZhi()
        },
        yi: itemsText(lunar.getDayYi()),
        ji: itemsText(lunar.getDayJi()),
        shengxiao: zodiacName(lunar.getYearShengXiao()),
        xingzuo: signName(solar.getXingZuo()),
        termToday: termName(lunar.getJieQi()),
        prevTerm: { name: termName(prev.getName()), days: dayNumber(this.date) - dayNumber(solarDate(prev.getSolar())) + 1 },
        nextTerm: {
          name: termName(next.getName()),
          when: `${formatMonthDay(solarDate(nextSolar))} ${pad(nextSolar.getHour())}:${pad(nextSolar.getMinute())}`,
          epoch: beijingEpoch(nextSolar),
          days: dayNumber(solarDate(nextSolar)) - dayNumber(this.date)
        },
        chongSha: chongShaText(lunar.getDayChongDesc(), lunar.getDaySha()),
        tianShen: lunar.getDayTianShen(),
        tianShenType: t(tianShenGood ? 'tools.almanac.luckyDay' : 'tools.almanac.unluckyDay', { type: lunar.getDayTianShenType(), luck: lunar.getDayTianShenLuck() }),
        tianShenGood,
        zhiXing: lunar.getZhiXing(),
        xiu: `${lunar.getXiu()}${lunar.getZheng()}${lunar.getAnimal()}`,
        xiuLuck: t(xiuGood ? 'tools.almanac.lucky' : 'tools.almanac.unlucky'),
        xiuGood,
        gong: t('tools.almanac.gong', { gong: directionName(lunar.getGong()), shou: translated('beasts', lunar.getShou()) }),
        nayin: `${lunar.getYearNaYin()} ${lunar.getMonthNaYin()} ${lunar.getDayNaYin()}`,
        tai: lunar.getDayPositionTai(),
        pengzu: `${lunar.getPengZuGan()}\u3000${lunar.getPengZuZhi()}`,
        positions: {
          xi: directionName(lunar.getDayPositionXiDesc()),
          fu: directionName(lunar.getDayPositionFuDesc()),
          cai: directionName(lunar.getDayPositionCaiDesc()),
          yangGui: directionName(lunar.getDayPositionYangGuiDesc()),
          yinGui: directionName(lunar.getDayPositionYinGuiDesc())
        },
        jiShen: lunar.getDayJiShen(),
        xiongSha: lunar.getDayXiongSha(),
        wuhou: lunar.getWuHou(),
        yuexiang: translated('moons', lunar.getYueXiang()),
        extra: [shuJiu && shuJiu.toFullString(), fu && fu.toFullString()].filter(Boolean).join(' · ')
      }
    },
    termCountdown() {
      const next = this.info.nextTerm
      if (!this.isToday) {
        return next.days === 0 ? t('tools.almanac.sameDay') : tc('tools.almanac.daysFromDate', next.days)
      }
      const left = Math.max(0, next.epoch - this.now)
      return t('tools.almanac.timeLeft', {
        days: Math.floor(left / 86400000),
        hours: Math.floor((left % 86400000) / 3600000),
        minutes: Math.floor((left % 3600000) / 60000)
      })
    },
    hours() {
      if (!this.lunar) {
        return []
      }
      const current = new Date(this.now).getHours()
      return this.lunar.getTimes().map((time, index, times) => {
        const zhi = time.getZhi()
        // The day both begins and ends in the 子 hour
        const key = index === 0 ? 'earlyZi' : index === times.length - 1 ? 'lateZi' : 'hourName'
        const start = time.getMinHm()
        const end = time.getMaxHm()
        const startHour = +start.slice(0, 2)
        const endHour = +end.slice(0, 2)
        const good = isLucky(time.getTianShenLuck())
        return {
          key: index,
          name: t(`tools.almanac.${key}`, { zhi }),
          range: `${start}–${end}`,
          ganzhi: time.getGanZhi(),
          tianShen: t('tools.almanac.hourTianShen', { name: time.getTianShen(), type: time.getTianShenType() }),
          luck: t(good ? 'tools.almanac.luckyShort' : 'tools.almanac.unluckyShort'),
          good,
          chongSha: chongShaText(time.getChongDesc(), time.getSha()),
          yi: itemsText(time.getYi()),
          ji: itemsText(time.getJi()),
          current: this.isToday && current >= startHour && current <= endHour
        }
      })
    }
  },
  watch: {
    params: {
      immediate: true,
      handler(params) {
        if (params && params.date) {
          this.dateText = params.date
        }
      }
    }
  },
  created() {
    this.timer = setInterval(() => {
      this.now = Date.now()
    }, 30000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    move(days) {
      this.dateText = formatYmd(addDays(this.date || today(), days))
    },
    goToday() {
      this.dateText = formatYmd(today())
      this.now = Date.now()
    }
  }
}
</script>

<style lang="scss">
// A paper almanac leaf inside the Aqua window
.almanac__page {
  max-width: 760px;
  margin: 0 auto;
  border: 1px solid #c9b78f;
  border-radius: 3px;
  background: linear-gradient(to bottom, #fffdf6, #fbf5e6);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 0 0 4px #fffdf6, inset 0 0 0 5px rgba(196, 30, 20, 0.35);
}

.almanac__masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 10px 10px 0;
  padding: 5px 12px;
  border-radius: 2px;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(to bottom, #e0453a, #b8170e);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.3);
}

.almanac__hero {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px 18px 6px;
}

.almanac__side {
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 15px;
  color: #6b4a1f;

  p {
    margin: 2px 0;
  }
}

.almanac__side--right {
  text-align: right;
}

.almanac__lunar-big {
  font-size: 22px;
  line-height: 1.35;
  color: #b8170e;
  writing-mode: horizontal-tb;
}

.almanac__day-wrap {
  text-align: center;
}

.almanac__day {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 104px;
  font-weight: bold;
  line-height: 1;
  color: #c41e14;
  text-shadow: 0 2px 0 rgba(120, 10, 0, 0.15);

  &.is-weekend {
    color: #d8261b;
  }
}

.almanac__festivals {
  min-height: 20px;
  margin: 4px 0 0;
  font-size: 12px;
}

.almanac__festival {
  display: inline-block;
  margin: 0 3px 3px;
  padding: 0 7px;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(to bottom, #e0453a, #b8170e);
}

.almanac__holiday {
  color: #8a1a12;
}

.almanac__badge {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 2px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  color: #fff;

  // "Off" and "Work" need more room than 休 and 班
  &:lang(en) {
    width: auto;
    padding: 0 4px;
  }

  &.is-rest {
    background: #d8261b;
  }

  &.is-work {
    background: #5c6676;
  }
}

.almanac__yiji {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 6px 14px;
  border-top: 2px solid #c41e14;
  border-bottom: 2px solid #c41e14;

  > div {
    display: flex;
    gap: 10px;
    padding: 10px 8px;
  }

  p {
    margin: 0;
    line-height: 1.7;
  }
}

.almanac__yi {
  border-right: 1px dashed #d8b6a0;
}

.almanac__stamp {
  flex: none;
  display: inline-block;
  width: 34px;
  height: 34px;
  border: 2px solid #c41e14;
  border-radius: 50%;
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 20px;
  font-weight: bold;
  line-height: 30px;
  text-align: center;
  color: #fff;
  background: radial-gradient(circle at 40% 35%, #f0584c, #c41e14 70%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.almanac__stamp--ji {
  border-color: #333;
  background: radial-gradient(circle at 40% 35%, #6d6d6d, #222 70%);
}

// "Do" and "Avoid" are words, not single seal characters
.almanac__stamp:lang(en) {
  font-family: inherit;
  font-size: 10px;
}

.almanac__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin: 0 14px;

  > div {
    display: flex;
    gap: 10px;
    padding: 6px 4px;
    border-bottom: 1px dotted #d8c7a3;
  }

  dt {
    flex: none;
    width: 86px;
    color: #9a5a2a;

    &:lang(en) {
      width: 104px;
    }
  }

  dd {
    margin: 0;
  }

  small {
    display: block;
    font-size: 11px;
    color: #7a6a55;
  }
}

.almanac__wide {
  grid-column: 1 / -1;
}

.almanac__hours {
  margin: 14px;

  h4 {
    margin: 0 0 6px;
    font-size: 13px;
    color: #9a2a1a;
  }

  .tool-table {
    background: #fff;
  }
}

.almanac__nowrap {
  white-space: nowrap;
}

.almanac__luck {
  display: inline-block;
  padding: 0 5px;
  border-radius: 3px;
  color: #fff;

  &.is-good {
    background: #c41e14;
  }

  &.is-bad {
    background: #5c5c5c;
  }
}

@media (max-width: 767px) {
  .almanac__hero {
    grid-template-columns: 1fr 1fr;
  }

  .almanac__day-wrap {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .almanac__day {
    font-size: 80px;
  }

  .almanac__yiji,
  .almanac__grid {
    grid-template-columns: 1fr;
  }

  .almanac__yi {
    border-right: 0;
    border-bottom: 1px dashed #d8b6a0;
  }
}
</style>
