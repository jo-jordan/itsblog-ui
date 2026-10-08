<template>
  <div class="toolbox" :class="{ 'is-inactive': !focused, 'is-compact': compact }">
    <nav v-if="!compact" class="toolbox__sidebar aqua-scroll" aria-label="工具">
      <section v-for="group in groups" :key="group.name" class="toolbox__group">
        <h3 class="toolbox__heading">{{ group.name }}</h3>
        <ul class="toolbox__list">
          <li v-for="item in group.tools" :key="item.id">
            <button
              type="button"
              class="aqua-row toolbox__item"
              :class="{ 'is-selected': item.id === current }"
              :aria-current="item.id === current ? 'page' : null"
              :data-tool="item.id"
              @click="select(item.id)"
            >
              <tool-glyph :name="item.glyph" />
              <span>{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </section>
    </nav>

    <div v-else class="toolbox__picker">
      <label for="toolbox-picker">工具：</label>
      <select id="toolbox-picker" class="aqua-popup" :value="current" @change="select($event.target.value)">
        <optgroup v-for="group in groups" :key="group.name" :label="group.name">
          <option v-for="item in group.tools" :key="item.id" :value="item.id">{{ item.name }}</option>
        </optgroup>
      </select>
    </div>

    <section class="toolbox__pane" :aria-label="tool.name">
      <header class="toolbox__header">
        <tool-glyph :name="tool.glyph" class="toolbox__header-glyph" />
        <div>
          <h2>{{ tool.name }}</h2>
          <p>{{ tool.summary }}</p>
        </div>
      </header>
      <div ref="content" class="toolbox__content aqua-scroll selectable">
        <!-- Timers keep running while another tool is shown -->
        <keep-alive include="ToolTimers">
          <component :is="tool.component" :key="tool.id" :params="params" @open="openTool" />
        </keep-alive>
      </div>
    </section>
  </div>
</template>

<script>
import ToolGlyph from './tools/ToolGlyph'
import Almanac from './tools/Almanac'
import MonthCalendar from './tools/MonthCalendar'
import LunarConverter from './tools/LunarConverter'
import SolarTerms from './tools/SolarTerms'
import Holidays from './tools/Holidays'
import DateDiff from './tools/DateDiff'
import DateShift from './tools/DateShift'
import Countdowns from './tools/Countdowns'
import AgeCalculator from './tools/AgeCalculator'
import WeekInfo from './tools/WeekInfo'
import Timestamp from './tools/Timestamp'
import WorldClock from './tools/WorldClock'
import Duration from './tools/Duration'
import Cron from './tools/Cron'
import Timers from './tools/Timers'
import { load, save } from './tools/lib/storage'
import { viewport } from '../utils/viewport'

const groups = [
  {
    name: '日历',
    tools: [
      { id: 'almanac', glyph: 'almanac', name: '黄历', component: Almanac, summary: '农历、干支、宜忌、冲煞、值神、星宿与十二时辰吉凶' },
      { id: 'calendar', glyph: 'calendar', name: '万年历', component: MonthCalendar, summary: '月历，含农历、节气、节日与法定放假调休' },
      { id: 'converter', glyph: 'converter', name: '农历公历互转', component: LunarConverter, summary: '公历与农历日期互相换算，支持闰月' },
      { id: 'terms', glyph: 'terms', name: '二十四节气', component: SolarTerms, summary: '任一年份的二十四节气交节时刻' },
      { id: 'holidays', glyph: 'holidays', name: '法定节假日', component: Holidays, summary: '国务院办公厅公布的放假与调休安排' }
    ]
  },
  {
    name: '日期计算',
    tools: [
      { id: 'diff', glyph: 'diff', name: '日期间隔', component: DateDiff, summary: '两个日期之间相隔多少天、周、月、年和工作日' },
      { id: 'shift', glyph: 'shift', name: '日期推算', component: DateShift, summary: '从某天起加减若干天、周、月、年或工作日' },
      { id: 'countdown', glyph: 'countdown', name: '倒数日', component: Countdowns, summary: '纪念日与倒数日，支持每年重复和农历日期' },
      { id: 'age', glyph: 'age', name: '年龄计算', component: AgeCalculator, summary: '周岁、虚岁、下次生日与生辰八字' },
      { id: 'week', glyph: 'week', name: '星期与周数', component: WeekInfo, summary: '星期、ISO 周数、一年中的第几天与季度' }
    ]
  },
  {
    name: '时间',
    tools: [
      { id: 'timestamp', glyph: 'timestamp', name: '时间戳转换', component: Timestamp, summary: 'Unix 时间戳与日期时间互转' },
      { id: 'worldclock', glyph: 'worldclock', name: '世界时钟', component: WorldClock, summary: '各地时间与时区换算' },
      { id: 'duration', glyph: 'duration', name: '时长计算', component: Duration, summary: '秒数与时分秒换算，时长与时刻加减' },
      { id: 'cron', glyph: 'cron', name: 'Cron 表达式', component: Cron, summary: '解释 cron 表达式并列出接下来的执行时间' },
      { id: 'timer', glyph: 'timer', name: '秒表与倒计时', component: Timers, summary: '秒表、倒计时与番茄钟' }
    ]
  }
]

const tools = groups.reduce((all, group) => all.concat(group.tools), [])

export default {
  name: 'Toolbox',
  components: { ToolGlyph },
  props: {
    win: { type: Object, required: true },
    focused: { type: Boolean, default: false }
  },
  data() {
    const saved = load('tool', 'almanac')
    return {
      groups,
      current: tools.some(tool => tool.id === saved) ? saved : 'almanac',
      // Handed to the tool when another tool opens it, e.g. 万年历 → 黄历 for a day
      params: null
    }
  },
  computed: {
    compact() {
      return viewport.compact
    },
    tool() {
      return tools.find(tool => tool.id === this.current)
    }
  },
  watch: {
    'tool.name': {
      immediate: true,
      handler(name) {
        this.$emit('title', `实用工具 — ${name}`)
      }
    }
  },
  methods: {
    select(id) {
      if (id !== this.current) {
        this.params = null
        this.current = id
        save('tool', id)
        this.$refs.content.scrollTop = 0
      }
    },
    openTool({ tool, ...params }) {
      this.select(tool)
      this.params = params
    }
  }
}
</script>

<style lang="scss">
.toolbox {
  flex: 1;
  display: flex;
  min-height: 0;
  border-top: 1px solid #9c9c9c;

  &.is-compact {
    flex-direction: column;
  }
}

// ---- Source list ----------------------------------------------------------------
.toolbox__sidebar {
  flex: none;
  width: 168px;
  border-right: 1px solid #9c9c9c;
  background: #e8edf4;
}

.toolbox__heading {
  margin: 0;
  padding: 7px 10px 2px;
  font-size: 11px;
  font-weight: bold;
  color: #5a6576;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

.toolbox__list {
  margin: 0 0 4px;
  padding: 0;
  list-style: none;
}

.toolbox__item {
  width: 100%;
  padding-left: 16px;
  border: 0;
  font: inherit;
  font-size: 12px;
  text-align: left;
  color: inherit;
  background: none;
  outline: none;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(61, 128, 223, 0.7);
  }

  &.is-selected {
    background: linear-gradient(to bottom, var(--aqua-highlight-top), var(--aqua-highlight) 50%, var(--aqua-highlight-bottom));
  }

  .is-inactive &.is-selected {
    color: #000;
    background: linear-gradient(to bottom, #e2e2e2, #c8c8c8);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.tool-glyph {
  flex: none;
  width: 16px;
  height: 16px;
}

.toolbox__picker {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #9c9c9c;

  select {
    flex: 1;
  }
}

// ---- Content pane ---------------------------------------------------------------
.toolbox__pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.toolbox__header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid #9c9c9c;

  h2 {
    margin: 0;
    font-size: 14px;
  }

  p {
    margin: 1px 0 0;
    font-size: 11px;
    color: #555;
  }
}

.toolbox__header-glyph {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

// Default buttons only pulse in the front window
.toolbox.is-inactive .aqua-button--default {
  animation: none;
}

.toolbox__content {
  flex: 1;
  min-height: 0;
  background: #fff;
}

// ---- Shared building blocks for the tools ---------------------------------------------
.tool {
  padding: 14px 18px 24px;
  font-size: 13px;
}

.tool-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;

  .aqua-button {
    min-width: 0;
  }
}

.tool-bar__spacer {
  flex: 1;
}

.tool-form {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 8px 10px;

  > label,
  > .tool-form__label {
    text-align: right;
  }

  // Controls keep their natural width inside the grid
  > .aqua-segmented,
  > select {
    justify-self: start;
    max-width: 100%;
  }
}

.tool-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.tool-number {
  width: 72px;
}

.tool-hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: #666;
}

.tool-note {
  margin: 0 0 12px;
  padding: 7px 10px 7px 30px;
  border: 1px solid #d8c06a;
  border-radius: 4px;
  font-size: 12px;
  background: #fffbe3 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M8 1.5 15 14H1z' fill='%23f5c400' stroke='%23946f00' stroke-linejoin='round'/%3E%3Cpath d='M8 6v4' stroke='%23000' stroke-width='1.6' stroke-linecap='round'/%3E%3Ccircle cx='8' cy='12' r='.9'/%3E%3C/svg%3E") 8px 8px no-repeat;
}

.tool-error {
  margin: 8px 0 0;
  color: #c0181b;
}

.tool-section {
  margin-top: 18px;

  > h4 {
    margin: 0 0 8px;
    padding-bottom: 3px;
    border-bottom: 1px solid #d0d0d0;
    font-size: 12px;
  }
}

// Read-only results as label / value pairs
.tool-results {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 5px 14px;
  margin: 12px 0 0;

  &:first-child {
    margin-top: 0;
  }

  dt {
    color: #555;
    text-align: right;
  }

  dd {
    margin: 0;
    font-weight: bold;
  }

  small {
    font-weight: normal;
    color: #666;
  }
}

p.tool-big {
  margin: 4px 0;
}

.tool-big {
  font-size: 26px;
  font-weight: bold;
  line-height: 1.2;
  color: #1d4f9c;
}

// Sherlock-style list view table
.tool-table {
  width: 100%;
  border: 1px solid #8c8c8c;
  border-collapse: collapse;
  font-size: 12px;

  th {
    height: 18px;
    padding: 0 8px;
    border-right: 1px solid #b5b5b5;
    border-bottom: 1px solid #8c8c8c;
    font-weight: normal;
    text-align: left;
    white-space: nowrap;
    background: linear-gradient(to bottom, #fdfdfd, #dedede);
  }

  td {
    padding: 3px 8px;
    vertical-align: top;
  }

  tbody tr:nth-child(even) {
    background: #edf3fe;
  }

  tbody tr.is-selected {
    color: #fff;
    background: var(--aqua-selection);

    .tool-muted,
    .tool-good,
    .tool-bad {
      color: inherit;
      opacity: 0.85;
    }
  }

  .is-inactive & tbody tr.is-selected {
    color: #000;
    background: var(--aqua-selection-inactive);
  }
}

.tool-table__wrap {
  overflow-x: auto;
}

.tool-good {
  color: #1a7f2b;
}

.tool-bad {
  color: #c0181b;
}

.tool-muted {
  color: #888;
}

@media (max-width: 767px) {
  .tool {
    padding: 12px 12px 20px;
  }

  // The pop-up already names the tool
  .toolbox__header {
    display: none;
  }
}
</style>
