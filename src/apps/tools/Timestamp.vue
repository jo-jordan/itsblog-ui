<template>
  <div class="tool timestamp">
    <fieldset class="aqua-group">
      <legend>当前时间戳</legend>
      <div class="timestamp__now">
        <div>
          <span>秒</span>
          <strong>{{ Math.floor(now / 1000) }}</strong>
          <button type="button" class="aqua-button" @click="copy(String(Math.floor(now / 1000)))">复制</button>
        </div>
        <div>
          <span>毫秒</span>
          <strong>{{ now }}</strong>
          <button type="button" class="aqua-button" @click="copy(String(now))">复制</button>
        </div>
        <button type="button" class="aqua-button" @click="paused = !paused">{{ paused ? '继续' : '暂停' }}</button>
      </div>
      <p class="tool-hint">本机时区：{{ localZone }}（{{ localOffset }}）{{ copied ? ` · 已复制 ${copied}` : '' }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>时间戳 → 日期时间</legend>
      <div class="tool-form">
        <label for="ts-input">时间戳：</label>
        <div class="tool-inline">
          <input id="ts-input" v-model.trim="tsText" type="text" inputmode="numeric" class="aqua-field timestamp__input" spellcheck="false">
          <select v-model="unit" class="aqua-popup" aria-label="单位">
            <option value="auto">自动识别</option>
            <option value="s">秒</option>
            <option value="ms">毫秒</option>
          </select>
          <button type="button" class="aqua-button" @click="tsText = String(Math.floor(Date.now() / 1000))">现在</button>
        </div>
        <span class="tool-form__label">时区：</span>
        <zone-select v-model="zone" />
      </div>
      <dl v-if="decoded" class="tool-results">
        <dt>识别为</dt>
        <dd>{{ decoded.unitLabel }}</dd>
        <dt>本机时间</dt>
        <dd>{{ decoded.local }}</dd>
        <dt>{{ zoneName }}</dt>
        <dd>{{ decoded.zoned }}</dd>
        <dt>UTC</dt>
        <dd>{{ decoded.utc }}</dd>
        <dt>ISO 8601</dt>
        <dd class="timestamp__mono">{{ decoded.iso }}<br>{{ decoded.isoZoned }}</dd>
        <dt>RFC 2822</dt>
        <dd class="timestamp__mono">{{ decoded.rfc }}</dd>
        <dt>相对时间</dt>
        <dd>{{ relative }}</dd>
      </dl>
      <p v-else class="tool-error">{{ decodeError }}</p>
      <p v-if="decoded && decoded.warning" class="tool-note">{{ decoded.warning }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>日期时间 → 时间戳</legend>
      <div class="tool-form">
        <label for="ts-date">日期时间：</label>
        <div class="tool-inline">
          <input id="ts-date" v-model="dateTimeText" type="datetime-local" step="1" class="aqua-field">
          <button type="button" class="aqua-button" @click="setNow">现在</button>
        </div>
        <span class="tool-form__label">所在时区：</span>
        <zone-select v-model="sourceZone" label="所在时区" />
      </div>
      <dl v-if="encoded" class="tool-results">
        <dt>秒</dt>
        <dd class="timestamp__mono">{{ encoded.seconds }}</dd>
        <dt>毫秒</dt>
        <dd class="timestamp__mono">{{ encoded.ms }}</dd>
        <dt>ISO 8601</dt>
        <dd class="timestamp__mono">{{ encoded.iso }}</dd>
        <dt>UTC 偏移</dt>
        <dd>{{ encoded.offset }}</dd>
      </dl>
      <p v-else class="tool-error">请输入有效的日期时间。</p>
      <p v-if="encoded && encoded.warning" class="tool-note">{{ encoded.warning }}</p>
    </fieldset>
  </div>
</template>

<script>
import ZoneSelect from './ZoneSelect'
import { pad, relativeTime, weekday, WEEKDAYS } from './lib/dates'
import { cityName, formatOffset, formatParts, isDst, LOCAL_ZONE, zonedToEpoch, zoneOffset, zoneParts } from './lib/zones'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_MS = 8.64e15

function describe(epoch, zone) {
  const parts = zoneParts(epoch, zone)
  const offset = zoneOffset(epoch, zone)
  return `${formatParts(parts)} 星期${WEEKDAYS[weekday(parts)]}（${formatOffset(offset)}${isDst(epoch, zone) ? '，夏令时' : ''}）`
}

function isoWithOffset(epoch, zone) {
  const parts = zoneParts(epoch, zone)
  const offset = zoneOffset(epoch, zone)
  const ms = ((epoch % 1000) + 1000) % 1000
  const sign = offset < 0 ? '-' : '+'
  const abs = Math.abs(offset)
  return `${formatParts(parts).replace(' ', 'T')}${ms ? `.${pad(ms, 3)}` : ''}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

function rfc2822(epoch, zone) {
  const parts = zoneParts(epoch, zone)
  const offset = zoneOffset(epoch, zone)
  const sign = offset < 0 ? '-' : '+'
  const abs = Math.abs(offset)
  return `${DAYS[weekday(parts)]}, ${pad(parts.d)} ${MONTHS[parts.m - 1]} ${parts.y} ${pad(parts.h)}:${pad(parts.mi)}:${pad(parts.s)} ${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`
}

function localInputValue(epoch) {
  const d = new Date(epoch)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default {
  name: 'ToolTimestamp',
  components: { ZoneSelect },
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const now = Date.now()
    return {
      now,
      paused: false,
      timer: null,
      copied: '',
      localZone: LOCAL_ZONE,
      tsText: String(Math.floor(now / 1000)),
      unit: 'auto',
      zone: LOCAL_ZONE === 'UTC' ? 'Asia/Shanghai' : 'UTC',
      dateTimeText: localInputValue(now),
      sourceZone: LOCAL_ZONE
    }
  },
  computed: {
    localOffset() {
      return formatOffset(zoneOffset(this.now, LOCAL_ZONE))
    },
    zoneName() {
      return cityName(this.zone)
    },
    decodeError() {
      return /^-?\d+(\.\d+)?$/.test(this.tsText) ? '时间戳超出可表示的范围。' : '请输入整数形式的时间戳。'
    },
    decoded() {
      if (!/^-?\d+(\.\d+)?$/.test(this.tsText)) {
        return null
      }
      const value = Number(this.tsText)
      // 12 digits and more read as milliseconds (seconds that large are past the year 5000)
      const unit = this.unit === 'auto' ? (Math.abs(value) >= 1e11 ? 'ms' : 's') : this.unit
      const epoch = Math.round(unit === 'ms' ? value : value * 1000)
      if (!Number.isFinite(epoch) || Math.abs(epoch) > MAX_MS) {
        return null
      }
      let warning = ''
      if (this.unit === 'auto' && Math.abs(value) >= 1e14) {
        warning = '这个数字有 15 位以上，可能是微秒或纳秒时间戳；请先除以 1000 或 1000000。'
      }
      return {
        unitLabel: unit === 'ms' ? '毫秒（13 位左右）' : '秒（10 位左右）',
        local: describe(epoch, LOCAL_ZONE),
        zoned: describe(epoch, this.zone),
        utc: describe(epoch, 'UTC'),
        iso: new Date(epoch).toISOString(),
        isoZoned: isoWithOffset(epoch, this.zone),
        rfc: rfc2822(epoch, this.zone),
        epoch,
        warning
      }
    },
    // Kept apart so the ticking clock does not re-run the conversions above
    relative() {
      return this.decoded ? relativeTime(this.decoded.epoch - this.now) : ''
    },
    encoded() {
      const match = /^(\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(this.dateTimeText || '')
      if (!match) {
        return null
      }
      const [, y, m, d, h, mi, s] = match.map(Number)
      const { epoch, valid } = zonedToEpoch({ y, m, d, h, mi, s: s || 0 }, this.sourceZone)
      return {
        seconds: Math.floor(epoch / 1000),
        ms: epoch,
        iso: new Date(epoch).toISOString(),
        offset: formatOffset(zoneOffset(epoch, this.sourceZone)),
        warning: valid ? '' : '该时区在这一刻因夏令时调整而跳过了这段时间，结果按调整后的时间计算。'
      }
    }
  },
  created() {
    this.timer = setInterval(() => {
      if (!this.paused) {
        this.now = Date.now()
      }
    }, 47)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    setNow() {
      this.dateTimeText = localInputValue(Date.now())
      this.sourceZone = LOCAL_ZONE
    },
    async copy(text) {
      try {
        await navigator.clipboard.writeText(text)
        this.copied = text
      } catch (e) {
        this.copied = ''
      }
    }
  }
}
</script>

<style lang="scss">
.timestamp__now {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 24px;

  > div {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  span {
    font-size: 11px;
    color: #555;
  }

  strong {
    min-width: 7ch;
    font-family: Monaco, Menlo, monospace;
    font-size: 20px;
    color: #1d4f9c;
  }

  .aqua-button {
    min-width: 0;
    font-size: 11px;
  }
}

.timestamp__input {
  width: 180px;
  font-family: Monaco, Menlo, monospace;
}


.timestamp__mono {
  font-family: Monaco, Menlo, monospace;
  font-weight: normal !important;
  word-break: break-all;
}
</style>
