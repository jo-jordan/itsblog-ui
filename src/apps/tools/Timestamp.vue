<template>
  <div class="tool timestamp">
    <fieldset class="aqua-group">
      <legend>{{ $t('tools.timestamp.current') }}</legend>
      <div class="timestamp__now">
        <div>
          <span>{{ $t('tools.timestamp.seconds') }}</span>
          <strong>{{ Math.floor(now / 1000) }}</strong>
          <button type="button" class="aqua-button" @click="copy(String(Math.floor(now / 1000)))">{{ $t('tools.timestamp.copy') }}</button>
        </div>
        <div>
          <span>{{ $t('tools.timestamp.milliseconds') }}</span>
          <strong>{{ now }}</strong>
          <button type="button" class="aqua-button" @click="copy(String(now))">{{ $t('tools.timestamp.copy') }}</button>
        </div>
        <button type="button" class="aqua-button" @click="paused = !paused">{{ paused ? $t('tools.timestamp.resume') : $t('tools.timestamp.pause') }}</button>
      </div>
      <p class="tool-hint">{{ $t('tools.timestamp.localZone', { zone: localZone, offset: localOffset }) }}{{ copied ? ` · ${$t('tools.timestamp.copied', { text: copied })}` : '' }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>{{ $t('tools.timestamp.decode') }}</legend>
      <div class="tool-form">
        <label for="ts-input">{{ $t('tools.timestamp.timestamp') }}</label>
        <div class="tool-inline">
          <input id="ts-input" v-model.trim="tsText" type="text" inputmode="numeric" class="aqua-field timestamp__input" spellcheck="false">
          <select v-model="unit" class="aqua-popup" :aria-label="$t('tools.timestamp.unit')">
            <option value="auto">{{ $t('tools.timestamp.auto') }}</option>
            <option value="s">{{ $t('tools.timestamp.seconds') }}</option>
            <option value="ms">{{ $t('tools.timestamp.milliseconds') }}</option>
          </select>
          <button type="button" class="aqua-button" @click="tsText = String(Math.floor(Date.now() / 1000))">{{ $t('tools.common.now') }}</button>
        </div>
        <span class="tool-form__label">{{ $t('tools.timestamp.timeZone') }}</span>
        <zone-select v-model="zone" />
      </div>
      <dl v-if="decoded" class="tool-results">
        <dt>{{ $t('tools.timestamp.readAs') }}</dt>
        <dd>{{ decoded.unitLabel }}</dd>
        <dt>{{ $t('tools.timestamp.localTime') }}</dt>
        <dd>{{ decoded.local }}</dd>
        <dt>{{ zoneName }}</dt>
        <dd>{{ decoded.zoned }}</dd>
        <dt>UTC</dt>
        <dd>{{ decoded.utc }}</dd>
        <dt>ISO 8601</dt>
        <dd class="timestamp__mono">{{ decoded.iso }}<br>{{ decoded.isoZoned }}</dd>
        <dt>RFC 2822</dt>
        <dd class="timestamp__mono">{{ decoded.rfc }}</dd>
        <dt>{{ $t('tools.timestamp.relative') }}</dt>
        <dd>{{ relative }}</dd>
      </dl>
      <p v-else class="tool-error">{{ decodeError }}</p>
      <p v-if="decoded && decoded.warning" class="tool-note">{{ decoded.warning }}</p>
    </fieldset>

    <fieldset class="aqua-group">
      <legend>{{ $t('tools.timestamp.encode') }}</legend>
      <div class="tool-form">
        <label for="ts-date">{{ $t('tools.timestamp.dateTime') }}</label>
        <div class="tool-inline">
          <input id="ts-date" v-model="dateTimeText" type="datetime-local" step="1" class="aqua-field">
          <button type="button" class="aqua-button" @click="setNow">{{ $t('tools.common.now') }}</button>
        </div>
        <span class="tool-form__label">{{ $t('tools.timestamp.sourceZone') }}</span>
        <zone-select v-model="sourceZone" :label="$t('tools.timestamp.sourceZoneLabel')" />
      </div>
      <dl v-if="encoded" class="tool-results">
        <dt>{{ $t('tools.timestamp.seconds') }}</dt>
        <dd class="timestamp__mono">{{ encoded.seconds }}</dd>
        <dt>{{ $t('tools.timestamp.milliseconds') }}</dt>
        <dd class="timestamp__mono">{{ encoded.ms }}</dd>
        <dt>ISO 8601</dt>
        <dd class="timestamp__mono">{{ encoded.iso }}</dd>
        <dt>{{ $t('tools.timestamp.utcOffset') }}</dt>
        <dd>{{ encoded.offset }}</dd>
      </dl>
      <p v-else class="tool-error">{{ $t('tools.timestamp.invalidDate') }}</p>
      <p v-if="encoded && encoded.warning" class="tool-note">{{ encoded.warning }}</p>
    </fieldset>
  </div>
</template>

<script>
import ZoneSelect from './ZoneSelect.vue'
import { pad, weekday } from './lib/dates'
import { relativeTime, t, weekdayName } from './lib/i18n'
import { cityName, formatOffset, formatParts, isDst, LOCAL_ZONE, zonedToEpoch, zoneOffset, zoneParts } from './lib/zones'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_MS = 8.64e15

function describe(epoch, zone) {
  const parts = zoneParts(epoch, zone)
  const offset = zoneOffset(epoch, zone)
  return t(isDst(epoch, zone) ? 'tools.timestamp.momentDst' : 'tools.timestamp.moment', {
    time: formatParts(parts),
    weekday: weekdayName(weekday(parts), 'long'),
    offset: formatOffset(offset)
  })
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
      return this.$t(/^-?\d+(\.\d+)?$/.test(this.tsText) ? 'tools.timestamp.outOfRange' : 'tools.timestamp.notNumber')
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
        warning = this.$t('tools.timestamp.tooLong')
      }
      return {
        unitLabel: this.$t(unit === 'ms' ? 'tools.timestamp.asMilliseconds' : 'tools.timestamp.asSeconds'),
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
        warning: valid ? '' : this.$t('tools.timestamp.skipped')
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
  beforeUnmount() {
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
