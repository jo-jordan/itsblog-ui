<template>
  <div class="tool almanac">
    <div class="tool-bar">
      <button type="button" class="aqua-button" aria-label="前一天" @click="move(-1)">◀ 前一天</button>
      <input v-model="dateText" type="date" class="aqua-field" min="1900-01-01" max="2100-12-31" aria-label="日期">
      <button type="button" class="aqua-button" aria-label="后一天" @click="move(1)">后一天 ▶</button>
      <span class="tool-bar__spacer" />
      <button type="button" class="aqua-button" @click="goToday">今天</button>
    </div>

    <article v-if="info" class="almanac__page">
      <header class="almanac__masthead">
        <span>{{ date.y }}年{{ date.m }}月</span>
        <strong>{{ info.yearLabel }}</strong>
        <span>星期{{ info.week }}</span>
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
              {{ info.holiday.work ? '班' : '休' }}
            </span>
            <span v-if="info.holiday" class="almanac__holiday">{{ info.holiday.name }}{{ info.holiday.work ? '调休上班' : '放假' }}</span>
          </p>
        </div>
        <div class="almanac__side almanac__side--right">
          <p>{{ info.ganzhi.year }}年</p>
          <p>{{ info.ganzhi.month }}月</p>
          <p>{{ info.ganzhi.day }}日</p>
        </div>
      </div>

      <div class="almanac__yiji">
        <div class="almanac__yi">
          <span class="almanac__stamp">宜</span>
          <p>{{ info.yi.join(' ') }}</p>
        </div>
        <div class="almanac__ji">
          <span class="almanac__stamp almanac__stamp--ji">忌</span>
          <p>{{ info.ji.join(' ') }}</p>
        </div>
      </div>

      <dl class="almanac__grid">
        <div>
          <dt>生肖 · 星座</dt>
          <dd>{{ info.shengxiao }} · {{ info.xingzuo }}座</dd>
        </div>
        <div>
          <dt>节气</dt>
          <dd>
            <template v-if="info.termToday">今日{{ info.termToday }}</template>
            <template v-else>{{ info.prevTerm.name }}后第 {{ info.prevTerm.days }} 天</template>
            <small>下一节气 {{ info.nextTerm.name }} {{ info.nextTerm.when }}，{{ termCountdown }}</small>
          </dd>
        </div>
        <div>
          <dt>冲煞</dt>
          <dd>冲{{ info.chong }} 煞{{ info.sha }}</dd>
        </div>
        <div>
          <dt>值神</dt>
          <dd>{{ info.tianShen }} <span :class="info.tianShenGood ? 'tool-good' : 'tool-bad'">{{ info.tianShenType }}</span></dd>
        </div>
        <div>
          <dt>建除十二值星</dt>
          <dd>{{ info.zhiXing }}日</dd>
        </div>
        <div>
          <dt>二十八星宿</dt>
          <dd>
            {{ info.xiu }} <span :class="info.xiuGood ? 'tool-good' : 'tool-bad'">{{ info.xiuLuck }}</span>
            <small>{{ info.gong }}</small>
          </dd>
        </div>
        <div>
          <dt>纳音五行</dt>
          <dd>{{ info.nayin }}</dd>
        </div>
        <div>
          <dt>胎神占方</dt>
          <dd>{{ info.tai }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>彭祖百忌</dt>
          <dd>{{ info.pengzu }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>吉神方位</dt>
          <dd>喜神 {{ info.xi }} · 福神 {{ info.fu }} · 财神 {{ info.cai }} · 阳贵 {{ info.yangGui }} · 阴贵 {{ info.yinGui }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>吉神宜趋</dt>
          <dd class="tool-good">{{ info.jiShen.join(' ') || '无' }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>凶煞宜忌</dt>
          <dd class="tool-bad">{{ info.xiongSha.join(' ') || '无' }}</dd>
        </div>
        <div class="almanac__wide">
          <dt>物候 · 月相</dt>
          <dd>{{ info.wuhou }} · {{ info.yuexiang }}月<template v-if="info.extra"> · {{ info.extra }}</template></dd>
        </div>
      </dl>

      <section class="almanac__hours">
        <h4>时辰吉凶</h4>
        <div class="tool-table__wrap">
          <table class="tool-table">
            <thead>
              <tr><th>时辰</th><th>时间</th><th>干支</th><th>值神</th><th>吉凶</th><th>冲煞</th><th>宜</th><th>忌</th></tr>
            </thead>
            <tbody>
              <tr v-for="hour in hours" :key="hour.key" :class="{ 'is-selected': hour.current }">
                <td class="almanac__nowrap">{{ hour.name }}</td>
                <td class="almanac__nowrap">{{ hour.range }}</td>
                <td>{{ hour.ganzhi }}</td>
                <td class="almanac__nowrap">{{ hour.tianShen }}</td>
                <td><span class="almanac__luck" :class="hour.good ? 'is-good' : 'is-bad'">{{ hour.luck }}</span></td>
                <td class="almanac__nowrap">冲{{ hour.chong }} 煞{{ hour.sha }}</td>
                <td>{{ hour.yi }}</td>
                <td>{{ hour.ji }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
    <p v-else class="tool-error">请选择 1900 至 2100 年之间的日期。</p>
  </div>
</template>

<script>
import { addDays, dayNumber, formatYmd, parseYmd, sameDay, today, WEEKDAYS, isWeekend, pad } from './lib/dates'
import { beijingEpoch, holidayOf, lunarOf, lunarMonthName } from './lib/calendar'

// "(丙辰)龙" → "龙（丙辰）"
function chongText(desc) {
  return desc.replace(/^\((.+)\)(.+)$/, '$2（$1）')
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
      return {
        yearLabel: `农历${lunar.getYearInGanZhi()}年（${lunar.getYearShengXiao()}年）`,
        week: WEEKDAYS[solar.getWeek()],
        weekend: isWeekend(this.date),
        lunarMonth: lunarMonthName(lunar),
        lunarDay: lunar.getDayInChinese(),
        festivals: [...new Set(festivals)],
        holiday: holidayOf(this.date),
        ganzhi: {
          // The year changes at 立春 and the month at each 节, as the 干支 calendar does
          year: lunar.getYearInGanZhiByLiChun(),
          month: lunar.getMonthInGanZhi(),
          day: lunar.getDayInGanZhi()
        },
        yi: lunar.getDayYi(),
        ji: lunar.getDayJi(),
        shengxiao: lunar.getYearShengXiao(),
        xingzuo: solar.getXingZuo(),
        termToday: lunar.getJieQi(),
        prevTerm: { name: prev.getName(), days: dayNumber(this.date) - dayNumber(solarDate(prev.getSolar())) + 1 },
        nextTerm: {
          name: next.getName(),
          when: `${nextSolar.getMonth()}月${nextSolar.getDay()}日 ${pad(nextSolar.getHour())}:${pad(nextSolar.getMinute())}`,
          epoch: beijingEpoch(nextSolar),
          days: dayNumber(solarDate(nextSolar)) - dayNumber(this.date)
        },
        chong: chongText(lunar.getDayChongDesc()),
        sha: lunar.getDaySha(),
        tianShen: lunar.getDayTianShen(),
        tianShenType: `${lunar.getDayTianShenType()}${lunar.getDayTianShenLuck()}日`,
        tianShenGood: lunar.getDayTianShenLuck() === '吉',
        zhiXing: lunar.getZhiXing(),
        xiu: `${lunar.getXiu()}${lunar.getZheng()}${lunar.getAnimal()}`,
        xiuLuck: lunar.getXiuLuck(),
        xiuGood: lunar.getXiuLuck() === '吉',
        gong: `${lunar.getGong()}方${lunar.getShou()}`,
        nayin: `${lunar.getYearNaYin()} ${lunar.getMonthNaYin()} ${lunar.getDayNaYin()}`,
        tai: lunar.getDayPositionTai(),
        pengzu: `${lunar.getPengZuGan()}　${lunar.getPengZuZhi()}`,
        xi: lunar.getDayPositionXiDesc(),
        fu: lunar.getDayPositionFuDesc(),
        cai: lunar.getDayPositionCaiDesc(),
        yangGui: lunar.getDayPositionYangGuiDesc(),
        yinGui: lunar.getDayPositionYinGuiDesc(),
        jiShen: lunar.getDayJiShen(),
        xiongSha: lunar.getDayXiongSha(),
        wuhou: lunar.getWuHou(),
        yuexiang: lunar.getYueXiang(),
        extra: [shuJiu && shuJiu.toFullString(), fu && fu.toFullString()].filter(Boolean).join(' · ')
      }
    },
    termCountdown() {
      const next = this.info.nextTerm
      if (!this.isToday) {
        return next.days === 0 ? '即在当天' : `距此还有 ${next.days} 天`
      }
      const left = Math.max(0, next.epoch - this.now)
      const days = Math.floor(left / 86400000)
      const hours = Math.floor((left % 86400000) / 3600000)
      const minutes = Math.floor((left % 3600000) / 60000)
      return `还有 ${days} 天 ${hours} 小时 ${minutes} 分`
    },
    hours() {
      if (!this.lunar) {
        return []
      }
      const current = new Date(this.now).getHours()
      return this.lunar.getTimes().map((time, index, times) => {
        const zhi = time.getZhi()
        const late = index === times.length - 1
        const start = time.getMinHm()
        const end = time.getMaxHm()
        const startHour = +start.slice(0, 2)
        const endHour = +end.slice(0, 2)
        return {
          key: index,
          name: zhi === '子' ? (late ? '夜子时' : '早子时') : `${zhi}时`,
          range: `${start}–${end}`,
          ganzhi: time.getGanZhi(),
          tianShen: `${time.getTianShen()}（${time.getTianShenType()}）`,
          luck: time.getTianShenLuck(),
          good: time.getTianShenLuck() === '吉',
          chong: chongText(time.getChongDesc()),
          sha: time.getSha(),
          yi: time.getYi().join(' '),
          ji: time.getJi().join(' '),
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
  beforeDestroy() {
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
