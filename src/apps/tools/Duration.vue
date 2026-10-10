<template>
  <div class="tool duration">
    <fieldset class="aqua-group">
      <legend>{{ $t('tools.duration.fromSeconds') }}</legend>
      <div class="tool-form">
        <label for="duration-seconds">{{ $t('tools.duration.secondsLabel') }}</label>
        <input id="duration-seconds" v-model.trim="secondsText" type="text" inputmode="decimal" class="aqua-field duration__wide" spellcheck="false">
      </div>
      <dl v-if="fromSeconds" class="tool-results">
        <dt>{{ $t('tools.duration.duration') }}</dt>
        <dd>{{ fromSeconds.text }}</dd>
        <dt>{{ $t('tools.duration.clock') }}</dt>
        <dd class="duration__mono">{{ fromSeconds.clock }}</dd>
        <dt>{{ $t('tools.duration.totals') }}</dt>
        <dd>{{ $t('tools.duration.totalsText', fromSeconds.totals) }}</dd>
      </dl>
      <p v-else class="tool-error">{{ $t('tools.duration.enterSeconds') }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>{{ $t('tools.duration.toSeconds') }}</legend>
      <div class="tool-inline">
        <label v-for="unit in units" :key="unit.key" class="tool-inline"><input v-model.number="parts[unit.key]" type="number" min="0" class="aqua-field duration__part" :aria-label="unit.label"> {{ unit.label }}</label>
      </div>
      <dl class="tool-results">
        <dt>{{ $t('tools.duration.total') }}</dt>
        <dd>
          <span v-if="partsSeconds !== null">{{ secondsAmount(partsSeconds) }} <small>{{ $t('tools.duration.paren', { text: partsFormatted.clock }) }}</small></span>
          <span v-else class="tool-bad">{{ $t('tools.duration.enterNumbers') }}</span>
        </dd>
      </dl>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>{{ $t('tools.duration.sum') }}</legend>
      <div class="tool-form">
        <label for="duration-expr">{{ $t('tools.duration.expression') }}</label>
        <input id="duration-expr" v-model="expression" type="text" class="aqua-field duration__wide" spellcheck="false" :placeholder="$t('tools.duration.expressionExample')">
      </div>
      <p class="tool-hint">{{ $t('tools.duration.formats') }}</p>
      <dl v-if="sum.seconds !== undefined" class="tool-results">
        <dt>{{ $t('tools.duration.result') }}</dt>
        <dd><span class="tool-big">{{ sumFormatted.clock }}</span></dd>
        <dt>{{ $t('tools.duration.equals') }}</dt>
        <dd>{{ sumFormatted.text }} <small>{{ $t('tools.duration.paren', { text: secondsAmount(sum.seconds, sumFormatted.totals.seconds) }) }}</small></dd>
      </dl>
      <p v-else class="tool-error">{{ sum.error }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>{{ $t('tools.duration.clockMath') }}</legend>
      <div class="tool-inline">
        <input v-model="clockText" type="time" step="1" class="aqua-field" :aria-label="$t('tools.duration.time')">
        <div class="aqua-segmented" role="group" :aria-label="$t('tools.duration.sign')">
          <button type="button" :class="{ 'is-selected': clockSign === 1 }" :aria-pressed="clockSign === 1 ? 'true' : 'false'" @click="clockSign = 1">+</button>
          <button type="button" :class="{ 'is-selected': clockSign === -1 }" :aria-pressed="clockSign === -1 ? 'true' : 'false'" @click="clockSign = -1">−</button>
        </div>
        <input v-model="clockDuration" type="text" class="aqua-field" spellcheck="false" :aria-label="$t('tools.duration.duration')" :placeholder="$t('tools.duration.durationExample')">
      </div>
      <dl v-if="clockResult" class="tool-results">
        <dt>{{ $t('tools.duration.result') }}</dt>
        <dd><span class="tool-big">{{ clockResult.time }}</span> {{ clockResult.days }}</dd>
      </dl>
      <p v-else class="tool-error">{{ $t('tools.duration.enterBoth') }}</p>
    </fieldset>
  </div>
</template>

<script>
import { pad } from './lib/dates'
import { evaluateDurations, formatDuration, parseDuration } from './lib/duration'
import { formatNumber } from './lib/i18n'

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
    units() {
      return [['d', 'days'], ['h', 'hours'], ['m', 'minutes'], ['s', 'seconds']].map(([key, unit]) => ({ key, label: this.$t(`tools.duration.units.${unit}`) }))
    },
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
        days: days === 0 ? this.$t('tools.duration.sameDay') : days === 1 ? this.$t('tools.duration.nextDay') : days === -1 ? this.$t('tools.duration.previousDay') : this.$t(days > 0 ? 'tools.duration.daysLater' : 'tools.duration.daysEarlier', { n: Math.abs(days) })
      }
    }
  },
  methods: {
    // "93,600 seconds"; `text` is the number when it has already been formatted
    secondsAmount(seconds, text = formatNumber(seconds)) {
      return this.$tc('tools.duration.seconds', Math.abs(seconds) === 1 ? 1 : 2, { n: text })
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
