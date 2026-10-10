<template>
  <div class="tool cron">
    <div class="tool-form">
      <label for="cron-input">{{ $t('tools.cron.expression') }}</label>
      <input id="cron-input" v-model="expression" type="text" class="aqua-field cron__input" spellcheck="false" autocomplete="off" :placeholder="$t('tools.cron.placeholder')">
      <label for="cron-preset">{{ $t('tools.cron.presetsLabel') }}</label>
      <div class="tool-inline">
        <select id="cron-preset" class="aqua-popup" :value="presetValue" @change="expression = $event.target.value">
          <option value="" disabled>{{ $t('tools.cron.choosePreset') }}</option>
          <option v-for="preset in presets" :key="preset.value" :value="preset.value">{{ $t('tools.cron.presetOption', preset) }}</option>
        </select>
      </div>
      <span class="tool-form__label">{{ $t('tools.cron.timeZone') }}</span>
      <zone-select v-model="zone" />
    </div>

    <template v-if="parsed">
      <div class="tool-section">
        <h4>{{ $t('tools.cron.meaning') }}</h4>
        <p class="cron__description">{{ description }}</p>
        <p v-if="orSemantics" class="tool-hint">{{ $t('tools.cron.orHint') }}</p>
      </div>

      <div class="tool-section">
        <h4>{{ $t('tools.cron.fieldsTitle') }}</h4>
        <div class="tool-table__wrap">
          <table class="tool-table">
            <thead>
              <tr><th v-for="column in ['field', 'raw', 'meaning', 'values']" :key="column">{{ $t(`tools.cron.columns.${column}`) }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="field in fields" :key="field.key">
                <td>{{ field.label }}</td>
                <td class="cron__mono">{{ field.raw }}</td>
                <td>{{ field.text }}</td>
                <td>{{ field.list }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="tool-section">
        <h4>{{ $tc('tools.cron.nextRuns', runs.length, { zone: zoneLabel }) }}</h4>
        <ol v-if="runs.length" class="cron__runs">
          <li v-for="run in runs" :key="run.epoch">
            <span class="cron__mono">{{ run.time }}</span>
            <span class="cron__weekday">{{ run.week }}</span>
            <span class="tool-muted">{{ run.relative }}</span>
          </li>
        </ol>
        <p v-else class="tool-note">{{ $t('tools.cron.noRuns') }}</p>
      </div>
    </template>
    <p v-else class="tool-error">{{ error }}</p>

    <details class="cron__help">
      <summary>{{ $t('tools.cron.help.title') }}</summary>
      <ul>
        <li>{{ $t('tools.cron.help.fields') }}</li>
        <i18n-t keypath="tools.cron.help.syntax" tag="li" scope="global">
          <template v-for="(code, name) in syntax" :key="name" #[name]><code>{{ code }}</code></template>
        </i18n-t>
        <i18n-t keypath="tools.cron.help.macros" tag="li" scope="global">
          <template v-for="(code, name) in macros" :key="name" #[name]><code>{{ code }}</code></template>
        </i18n-t>
        <li>{{ $t('tools.cron.help.dst') }}</li>
      </ul>
    </details>
  </div>
</template>

<script>
import ZoneSelect from './ZoneSelect.vue'
import { weekday } from './lib/dates'
import { relativeTime, weekdayName } from './lib/i18n'
import { describeCron, fieldSummary, nextRuns, parseCron } from './lib/cron'
import { cityName, formatOffset, formatParts, LOCAL_ZONE, zoneOffset, zoneParts } from './lib/zones'
import { load, save } from './lib/storage'

// Labels are tools.cron.presets.<id>
const PRESETS = [
  { id: 'everyMinute', value: '* * * * *' },
  { id: 'every5Minutes', value: '*/5 * * * *' },
  { id: 'hourly', value: '0 * * * *' },
  { id: 'daily', value: '0 9 * * *' },
  { id: 'weekdays', value: '0 9 * * 1-5' },
  { id: 'workHours', value: '*/15 9-17 * * MON-FRI' },
  { id: 'weekly', value: '0 10 * * MON' },
  { id: 'monthly', value: '0 0 1 * *' },
  { id: 'domOrDow', value: '30 8 1,15 * FRI' },
  { id: 'quarterly', value: '0 0 1 JAN,APR,JUL,OCT *' },
  { id: 'yearly', value: '@yearly' }
]

// The examples in the syntax notes, by their slot in tools.cron.help.*
const SYNTAX = { any: '*', list: '1,15', range: '9-17', step: '*/15', stepRange: '0-30/5', short: '5/20', long: '5-59/20' }
const MACROS = { yearly: '@yearly', monthly: '@monthly', weekly: '@weekly', daily: '@daily', hourly: '@hourly' }

export default {
  name: 'ToolCron',
  components: { ZoneSelect },
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      expression: load('cron', '0 9 * * 1-5'),
      zone: LOCAL_ZONE,
      syntax: SYNTAX,
      macros: MACROS,
      now: Date.now(),
      timer: null
    }
  },
  computed: {
    presets() {
      return PRESETS.map(preset => ({ value: preset.value, label: this.$t(`tools.cron.presets.${preset.id}`) }))
    },
    // An error is worded in the current language, so this runs again when that changes
    result() {
      try {
        return { parsed: parseCron(this.expression) }
      } catch (e) {
        return { error: e.message }
      }
    },
    parsed() {
      return this.result.parsed || null
    },
    error() {
      return this.result.error
    },
    presetValue() {
      const preset = PRESETS.find(item => item.value === this.expression.trim())
      return preset ? preset.value : ''
    },
    description() {
      return describeCron(this.parsed)
    },
    orSemantics() {
      const { dom, dow } = this.parsed.fields
      return !dom.star && !dow.star
    },
    fields() {
      return fieldSummary(this.parsed)
    },
    zoneLabel() {
      return this.$t('tools.cron.zoneLabel', { city: cityName(this.zone), offset: formatOffset(zoneOffset(this.now, this.zone)) })
    },
    runs() {
      // Recomputed each minute so the list stays in the future
      const minute = Math.floor(this.now / 60000) * 60000
      return nextRuns(this.parsed, this.zone, 10, minute + 59999).map(epoch => {
        const parts = zoneParts(epoch, this.zone)
        return {
          epoch,
          time: formatParts(parts, false),
          week: weekdayName(weekday(parts), 'short'),
          relative: relativeTime(epoch - this.now)
        }
      })
    }
  },
  watch: {
    expression(value) {
      save('cron', value)
    }
  },
  created() {
    this.timer = setInterval(() => {
      this.now = Date.now()
    }, 30000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
</script>

<style lang="scss">
.cron__input {
  width: 100%;
  max-width: 320px;
  font-family: Monaco, Menlo, monospace;
}

.cron__description {
  margin: 0;
  font-size: 15px;
  font-weight: bold;
  color: #1d4f9c;
}

.cron__mono {
  font-family: Monaco, Menlo, monospace;
}

.cron__runs {
  margin: 0;
  padding-left: 26px;
  font-size: 12px;

  li {
    padding: 2px 0;
  }

  span + span {
    margin-left: 10px;
  }
}

// Weekday names differ in width in English; keep the column after them aligned
.cron__weekday {
  display: inline-block;
  min-width: 2.2em;
}

.cron__help {
  margin-top: 18px;
  font-size: 12px;
  color: #444;

  summary {
    cursor: default;
  }

  code {
    padding: 0 3px;
    border-radius: 3px;
    font-family: Monaco, Menlo, monospace;
    background: #eef1f5;
  }
}
</style>
