<template>
  <div class="toolbox" :class="{ 'is-inactive': !focused, 'is-compact': compact }">
    <nav v-if="!compact" class="toolbox__sidebar aqua-scroll" :aria-label="$t('tools.toolbox.label')">
      <section v-for="group in groups" :key="group.id" class="toolbox__group">
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
      <label for="toolbox-picker">{{ $t('tools.toolbox.picker') }}</label>
      <select id="toolbox-picker" class="aqua-popup" :value="current" @change="select($event.target.value)">
        <optgroup v-for="group in groups" :key="group.id" :label="group.name">
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
import './tools/lib/i18n'
import ToolGlyph from './tools/ToolGlyph.vue'
import Almanac from './tools/Almanac.vue'
import MonthCalendar from './tools/MonthCalendar.vue'
import LunarConverter from './tools/LunarConverter.vue'
import SolarTerms from './tools/SolarTerms.vue'
import Holidays from './tools/Holidays.vue'
import DateDiff from './tools/DateDiff.vue'
import DateShift from './tools/DateShift.vue'
import Countdowns from './tools/Countdowns.vue'
import AgeCalculator from './tools/AgeCalculator.vue'
import WeekInfo from './tools/WeekInfo.vue'
import Timestamp from './tools/Timestamp.vue'
import WorldClock from './tools/WorldClock.vue'
import Duration from './tools/Duration.vue'
import Cron from './tools/Cron.vue'
import Timers from './tools/Timers.vue'
import { load, save } from './tools/lib/storage'
import { viewport } from '../utils/viewport'
import { apps } from './registry'

// Names and summaries are in locales/<locale>/toolbox.js, keyed by these ids
const groups = [
  {
    id: 'calendar',
    tools: [
      { id: 'almanac', glyph: 'almanac', component: Almanac },
      { id: 'calendar', glyph: 'calendar', component: MonthCalendar },
      { id: 'converter', glyph: 'converter', component: LunarConverter },
      { id: 'terms', glyph: 'terms', component: SolarTerms },
      { id: 'holidays', glyph: 'holidays', component: Holidays }
    ]
  },
  {
    id: 'dates',
    tools: [
      { id: 'diff', glyph: 'diff', component: DateDiff },
      { id: 'shift', glyph: 'shift', component: DateShift },
      { id: 'countdown', glyph: 'countdown', component: Countdowns },
      { id: 'age', glyph: 'age', component: AgeCalculator },
      { id: 'week', glyph: 'week', component: WeekInfo }
    ]
  },
  {
    id: 'time',
    tools: [
      { id: 'timestamp', glyph: 'timestamp', component: Timestamp },
      { id: 'worldclock', glyph: 'worldclock', component: WorldClock },
      { id: 'duration', glyph: 'duration', component: Duration },
      { id: 'cron', glyph: 'cron', component: Cron },
      { id: 'timer', glyph: 'timer', component: Timers }
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
  emits: ['title'],
  data() {
    const saved = load('tool', 'almanac')
    return {
      current: tools.some(tool => tool.id === saved) ? saved : 'almanac',
      // Handed to the tool when another tool opens it, e.g. the calendar opens the almanac for a day
      params: null
    }
  },
  computed: {
    compact() {
      return viewport.compact
    },
    // Names and summaries in the current language
    groups() {
      return groups.map(group => ({
        id: group.id,
        name: this.$t(`tools.toolbox.groups.${group.id}`),
        tools: group.tools.map(tool => ({
          ...tool,
          name: this.$t(`tools.toolbox.names.${tool.id}`),
          summary: this.$t(`tools.toolbox.summaries.${tool.id}`)
        }))
      }))
    },
    tool() {
      return this.groups.reduce((all, group) => all.concat(group.tools), []).find(tool => tool.id === this.current)
    },
    title() {
      return `${apps.toolbox.name} — ${this.tool.name}`
    }
  },
  watch: {
    title: {
      immediate: true,
      handler(title) {
        this.$emit('title', title)
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
