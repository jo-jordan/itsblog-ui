<template>
  <div class="tool cron">
    <div class="tool-form">
      <label for="cron-input">表达式：</label>
      <input id="cron-input" v-model="expression" type="text" class="aqua-field cron__input" spellcheck="false" autocomplete="off" placeholder="分 时 日 月 周">
      <label for="cron-preset">常用：</label>
      <div class="tool-inline">
        <select id="cron-preset" class="aqua-popup" :value="presetValue" @change="expression = $event.target.value">
          <option value="" disabled>选择一个示例…</option>
          <option v-for="preset in presets" :key="preset.value" :value="preset.value">{{ preset.label }}（{{ preset.value }}）</option>
        </select>
      </div>
      <span class="tool-form__label">时区：</span>
      <zone-select v-model="zone" />
    </div>

    <template v-if="parsed">
      <div class="tool-section">
        <h4>含义</h4>
        <p class="cron__description">{{ description }}</p>
        <p v-if="orSemantics" class="tool-hint">“日”和“星期”都有限定时，按 Vixie cron 的规则两者满足其一即执行；只要其中一个以 * 开头，则两者都要满足。</p>
      </div>

      <div class="tool-section">
        <h4>各字段</h4>
        <div class="tool-table__wrap">
          <table class="tool-table">
            <thead>
              <tr><th>字段</th><th>写法</th><th>含义</th><th>取值</th></tr>
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
        <h4>接下来 {{ runs.length }} 次执行（{{ zoneLabel }}）</h4>
        <ol v-if="runs.length" class="cron__runs">
          <li v-for="run in runs" :key="run.epoch">
            <span class="cron__mono">{{ run.time }}</span>
            <span>周{{ run.week }}</span>
            <span class="tool-muted">{{ run.relative }}</span>
          </li>
        </ol>
        <p v-else class="tool-note">在未来 28 年内找不到匹配的时间（例如 2 月 30 日）。</p>
      </div>
    </template>
    <p v-else class="tool-error">{{ error }}</p>

    <details class="cron__help">
      <summary>语法说明</summary>
      <ul>
        <li>五个字段依次是：分钟（0–59）、小时（0–23）、日（1–31）、月（1–12 或 JAN–DEC）、星期（0–7 或 SUN–SAT，0 和 7 都是周日）。</li>
        <li><code>*</code> 任意值；<code>1,15</code> 列表；<code>9-17</code> 范围；<code>*/15</code> 或 <code>0-30/5</code> 步长；<code>5/20</code> 等同 <code>5-59/20</code>。</li>
        <li>支持简写 <code>@yearly</code> <code>@monthly</code> <code>@weekly</code> <code>@daily</code> <code>@hourly</code>。</li>
        <li>夏令时开始时被跳过的时刻不会执行。</li>
      </ul>
    </details>
  </div>
</template>

<script>
import ZoneSelect from './ZoneSelect'
import { relativeTime, weekday, WEEKDAYS } from './lib/dates'
import { describeCron, fieldSummary, nextRuns, parseCron } from './lib/cron'
import { cityName, formatOffset, formatParts, LOCAL_ZONE, zoneOffset, zoneParts } from './lib/zones'
import { load, save } from './lib/storage'

const PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每小时整点', value: '0 * * * *' },
  { label: '每天 9 点', value: '0 9 * * *' },
  { label: '工作日 9 点', value: '0 9 * * 1-5' },
  { label: '工作时间每 15 分钟', value: '*/15 9-17 * * MON-FRI' },
  { label: '每周一 10 点', value: '0 10 * * MON' },
  { label: '每月 1 日凌晨', value: '0 0 1 * *' },
  { label: '每月 1、15 日或周五', value: '30 8 1,15 * FRI' },
  { label: '每季度首日', value: '0 0 1 JAN,APR,JUL,OCT *' },
  { label: '每年', value: '@yearly' }
]

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
      presets: PRESETS,
      now: Date.now(),
      timer: null
    }
  },
  computed: {
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
      return `${cityName(this.zone)}，${formatOffset(zoneOffset(this.now, this.zone))}`
    },
    runs() {
      // Recomputed each minute so the list stays in the future
      const minute = Math.floor(this.now / 60000) * 60000
      return nextRuns(this.parsed, this.zone, 10, minute + 59999).map(epoch => {
        const parts = zoneParts(epoch, this.zone)
        return {
          epoch,
          time: formatParts(parts, false),
          week: WEEKDAYS[weekday(parts)],
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
  beforeDestroy() {
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
