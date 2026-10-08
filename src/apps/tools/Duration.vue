<template>
  <div class="tool duration">
    <fieldset class="aqua-group">
      <legend>秒数 → 天 / 时 / 分 / 秒</legend>
      <div class="tool-form">
        <label for="duration-seconds">秒数：</label>
        <input id="duration-seconds" v-model.trim="secondsText" type="text" inputmode="decimal" class="aqua-field duration__wide" spellcheck="false">
      </div>
      <dl v-if="fromSeconds" class="tool-results">
        <dt>时长</dt>
        <dd>{{ fromSeconds.text }}</dd>
        <dt>时:分:秒</dt>
        <dd class="duration__mono">{{ fromSeconds.clock }}</dd>
        <dt>合计</dt>
        <dd>{{ fromSeconds.totals.minutes }} 分钟 · {{ fromSeconds.totals.hours }} 小时 · {{ fromSeconds.totals.days }} 天</dd>
      </dl>
      <p v-else class="tool-error">请输入秒数（可以有小数）。</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>天 / 时 / 分 / 秒 → 秒数</legend>
      <div class="tool-inline">
        <label class="tool-inline"><input v-model.number="parts.d" type="number" min="0" class="aqua-field duration__part" aria-label="天"> 天</label>
        <label class="tool-inline"><input v-model.number="parts.h" type="number" min="0" class="aqua-field duration__part" aria-label="小时"> 小时</label>
        <label class="tool-inline"><input v-model.number="parts.m" type="number" min="0" class="aqua-field duration__part" aria-label="分"> 分</label>
        <label class="tool-inline"><input v-model.number="parts.s" type="number" min="0" class="aqua-field duration__part" aria-label="秒"> 秒</label>
      </div>
      <dl class="tool-results">
        <dt>共</dt>
        <dd>
          <span v-if="partsSeconds !== null">{{ partsSeconds.toLocaleString('zh-CN') }} 秒 <small>（{{ partsFormatted.clock }}）</small></span>
          <span v-else class="tool-bad">请填写数字</span>
        </dd>
      </dl>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>时长加减</legend>
      <div class="tool-form">
        <label for="duration-expr">算式：</label>
        <input id="duration-expr" v-model="expression" type="text" class="aqua-field duration__wide" spellcheck="false" placeholder="例如 1:45:30 + 2:20 - 15m">
      </div>
      <p class="tool-hint">支持 1:45:30（时:分:秒）、2:20（时:分）、1天2小时30分、1h 30m 45s 等写法，纯数字按秒计。</p>
      <dl v-if="sum.seconds !== undefined" class="tool-results">
        <dt>结果</dt>
        <dd><span class="tool-big">{{ sumFormatted.clock }}</span></dd>
        <dt>即</dt>
        <dd>{{ sumFormatted.text }} <small>（{{ sumFormatted.totals.seconds }} 秒）</small></dd>
      </dl>
      <p v-else class="tool-error">{{ sum.error }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>时刻 ± 时长</legend>
      <div class="tool-inline">
        <input v-model="clockText" type="time" step="1" class="aqua-field" aria-label="时刻">
        <div class="aqua-segmented" role="group" aria-label="加或减">
          <button type="button" :class="{ 'is-selected': clockSign === 1 }" :aria-pressed="clockSign === 1 ? 'true' : 'false'" @click="clockSign = 1">+</button>
          <button type="button" :class="{ 'is-selected': clockSign === -1 }" :aria-pressed="clockSign === -1 ? 'true' : 'false'" @click="clockSign = -1">−</button>
        </div>
        <input v-model="clockDuration" type="text" class="aqua-field" spellcheck="false" aria-label="时长" placeholder="例如 2:45">
      </div>
      <dl v-if="clockResult" class="tool-results">
        <dt>结果</dt>
        <dd><span class="tool-big">{{ clockResult.time }}</span> {{ clockResult.days }}</dd>
      </dl>
      <p v-else class="tool-error">请输入时刻和时长。</p>
    </fieldset>
  </div>
</template>

<script>
import { pad } from './lib/dates'
import { evaluateDurations, formatDuration, parseDuration } from './lib/duration'

export default {
  name: 'ToolDuration',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      secondsText: '100000',
      parts: { d: 1, h: 2, m: 30, s: 0 },
      expression: '1:45:30 + 2:20',
      clockText: '09:30:00',
      clockSign: 1,
      clockDuration: '2:45'
    }
  },
  computed: {
    fromSeconds() {
      return /^-?\d+(\.\d+)?$/.test(this.secondsText) ? formatDuration(Number(this.secondsText)) : null
    },
    partsSeconds() {
      const { d, h, m, s } = this.parts
      const values = [d, h, m, s].map(value => (value === '' ? 0 : value))
      if (values.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
        return null
      }
      return values[0] * 86400 + values[1] * 3600 + values[2] * 60 + values[3]
    },
    partsFormatted() {
      return formatDuration(this.partsSeconds || 0)
    },
    sum() {
      return evaluateDurations(this.expression)
    },
    sumFormatted() {
      return formatDuration(this.sum.seconds || 0)
    },
    clockResult() {
      const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(this.clockText || '')
      const duration = parseDuration(this.clockDuration)
      if (!match || duration === null) {
        return null
      }
      const start = +match[1] * 3600 + +match[2] * 60 + +(match[3] || 0)
      const total = Math.round(start + this.clockSign * duration)
      const days = Math.floor(total / 86400)
      const rest = total - days * 86400
      return {
        time: `${pad(Math.floor(rest / 3600))}:${pad(Math.floor((rest % 3600) / 60))}:${pad(rest % 60)}`,
        days: days === 0 ? '（当天）' : days === 1 ? '（次日）' : days === -1 ? '（前一天）' : days > 0 ? `（${days} 天后）` : `（${-days} 天前）`
      }
    }
  }
}
</script>

<style lang="scss">
.duration__wide {
  width: 100%;
  max-width: 320px;
}

.duration__part {
  width: 64px;
}


.duration__mono {
  font-family: Monaco, Menlo, monospace;
}
</style>
