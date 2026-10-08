<template>
  <div class="tool world-clock">
    <ul class="world-clock__grid">
      <li v-for="clock in clocks" :key="clock.zone" class="world-clock__item">
        <button type="button" class="world-clock__remove" :aria-label="`移除 ${clock.name}`" title="移除" @click="remove(clock.zone)">×</button>
        <analog-clock :hours="clock.parts.h" :minutes="clock.parts.mi" :seconds="clock.parts.s" :label="`${clock.name} ${clock.time}`" />
        <strong class="world-clock__city">{{ clock.name }}</strong>
        <span class="world-clock__time">{{ clock.time }}</span>
        <span class="world-clock__meta">{{ clock.day }}</span>
        <span class="world-clock__meta">{{ clock.offset }}<span v-if="clock.dst" class="world-clock__dst">夏令时</span></span>
        <span class="world-clock__meta">{{ clock.diff }}</span>
      </li>
    </ul>

    <div class="tool-bar world-clock__add">
      <label for="world-clock-zone">添加城市或时区：</label>
      <zone-select id="world-clock-zone" v-model="newZone" label="添加城市或时区" />
      <button type="button" class="aqua-button" :disabled="zones.includes(newZone)" @click="add">添加</button>
    </div>

    <fieldset class="aqua-group">
      <legend>时区换算</legend>
      <div class="tool-form">
        <label for="world-clock-time">时间：</label>
        <div class="tool-inline">
          <input id="world-clock-time" v-model="sourceText" type="datetime-local" class="aqua-field">
          <button type="button" class="aqua-button" @click="resetSource">现在</button>
        </div>
        <span class="tool-form__label">所在时区：</span>
        <zone-select v-model="sourceZone" label="所在时区" />
      </div>
      <p v-if="conversion && !conversion.valid" class="tool-note">这一时刻在所选时区因夏令时调整并不存在，已按调整后的时间换算。</p>
      <div v-if="conversion" class="tool-table__wrap world-clock__table">
        <table class="tool-table">
          <thead>
            <tr><th>城市 / 时区</th><th>当地时间</th><th>星期</th><th>UTC 偏移</th><th>夏令时</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in conversion.rows" :key="row.zone" :class="{ 'is-selected': row.zone === sourceZone }">
              <td><strong>{{ row.name }}</strong> <small class="tool-muted">{{ row.zone }}</small></td>
              <td>{{ row.time }} <small v-if="row.shift" class="tool-muted">{{ row.shift }}</small></td>
              <td>周{{ row.week }}</td>
              <td>{{ row.offset }}</td>
              <td>{{ row.dst }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="tool-error">请输入有效的日期时间。</p>
    </fieldset>
  </div>
</template>

<script>
import AnalogClock from './AnalogClock'
import ZoneSelect from './ZoneSelect'
import { dayNumber, pad, weekday, WEEKDAYS } from './lib/dates'
import { cityName, formatOffset, isDst, isValidZone, LOCAL_ZONE, observesDst, zonedToEpoch, zoneOffset, zoneParts } from './lib/zones'
import { load, save } from './lib/storage'

const STORAGE_KEY = 'clocks'

function defaultZones() {
  const zones = ['Asia/Shanghai', 'Europe/London', 'America/New_York', 'Asia/Tokyo']
  return zones.includes(LOCAL_ZONE) ? zones : [LOCAL_ZONE, ...zones.slice(0, 3)]
}

function hoursText(minutes) {
  const hours = Math.abs(minutes) / 60
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(2).replace(/0$/, '')
}

function dayShift(parts, reference) {
  const diff = dayNumber(parts) - dayNumber(reference)
  return diff === 0 ? '' : diff === 1 ? '次日' : diff === -1 ? '前一日' : `${diff > 0 ? '+' : ''}${diff} 天`
}

function inputValue(parts) {
  return `${pad(parts.y, 4)}-${pad(parts.m)}-${pad(parts.d)}T${pad(parts.h)}:${pad(parts.mi)}`
}

export default {
  name: 'ToolWorldClock',
  components: { AnalogClock, ZoneSelect },
  props: {
    params: { type: Object, default: null }
  },
  data() {
    const stored = load(STORAGE_KEY, null)
    const zones = Array.isArray(stored) ? stored.filter(zone => typeof zone === 'string' && isValidZone(zone)) : defaultZones()
    return {
      now: Date.now(),
      timer: null,
      zones,
      newZone: 'Europe/Paris',
      sourceZone: LOCAL_ZONE,
      sourceText: inputValue(zoneParts(Date.now(), LOCAL_ZONE))
    }
  },
  computed: {
    clocks() {
      const local = zoneParts(this.now, LOCAL_ZONE)
      const localOffset = zoneOffset(this.now, LOCAL_ZONE)
      return this.zones.map(zone => {
        const parts = zoneParts(this.now, zone)
        const offset = zoneOffset(this.now, zone)
        const diff = offset - localOffset
        const shift = dayNumber(parts) - dayNumber(local)
        return {
          zone,
          name: cityName(zone),
          parts,
          time: `${pad(parts.h)}:${pad(parts.mi)}:${pad(parts.s)}`,
          day: `${shift === 0 ? '今天' : shift > 0 ? '明天' : '昨天'} ${parts.m}月${parts.d}日 周${WEEKDAYS[weekday(parts)]}`,
          offset: formatOffset(offset),
          dst: isDst(this.now, zone),
          diff: diff === 0 ? '与本机时间相同' : `比本机${diff > 0 ? '快' : '慢'} ${hoursText(diff)} 小时`
        }
      })
    },
    conversion() {
      const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(this.sourceText || '')
      if (!match) {
        return null
      }
      const [, y, m, d, h, mi] = match.map(Number)
      const { epoch, valid } = zonedToEpoch({ y, m, d, h, mi, s: 0 }, this.sourceZone)
      const source = zoneParts(epoch, this.sourceZone)
      const zones = [this.sourceZone, ...this.zones.filter(zone => zone !== this.sourceZone)]
      if (!zones.includes('UTC')) {
        zones.push('UTC')
      }
      return {
        valid,
        rows: zones.map(zone => {
          const parts = zoneParts(epoch, zone)
          return {
            zone,
            name: cityName(zone),
            time: `${parts.y}-${pad(parts.m)}-${pad(parts.d)} ${pad(parts.h)}:${pad(parts.mi)}`,
            shift: dayShift(parts, source),
            week: WEEKDAYS[weekday(parts)],
            offset: formatOffset(zoneOffset(epoch, zone)),
            dst: !observesDst(epoch, zone) ? '不实行' : isDst(epoch, zone) ? '是' : '否'
          }
        })
      }
    }
  },
  created() {
    this.tick()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    // Tick on the second so every clock moves together
    tick() {
      this.now = Date.now()
      this.timer = setTimeout(this.tick, 1000 - (this.now % 1000) + 5)
    },
    add() {
      if (!this.zones.includes(this.newZone)) {
        this.zones.push(this.newZone)
        save(STORAGE_KEY, this.zones)
      }
    },
    remove(zone) {
      this.zones = this.zones.filter(item => item !== zone)
      save(STORAGE_KEY, this.zones)
    },
    resetSource() {
      this.sourceText = inputValue(zoneParts(Date.now(), this.sourceZone))
    }
  }
}
</script>

<style lang="scss">
.world-clock__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}

.world-clock__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 10px 10px;
  border: 1px solid #b4b4b4;
  border-radius: 8px;
  background: var(--aqua-pinstripe) top left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  .analog-clock {
    width: 104px;
    margin-bottom: 6px;
  }

  &:hover .world-clock__remove {
    opacity: 1;
  }
}

.world-clock__remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  padding: 0;
  border: 1px solid #8c8c8c;
  border-radius: 50%;
  font: bold 11px/12px var(--aqua-font);
  color: #444;
  background: linear-gradient(to bottom, #fdfdfd, #d8d8d8);
  opacity: 0.55;
  cursor: default;

  &:focus-visible {
    opacity: 1;
    box-shadow: 0 0 0 3px rgba(61, 128, 223, 0.55);
  }
}

.world-clock__city {
  font-size: 14px;
}

.world-clock__time {
  font-family: Monaco, Menlo, monospace;
  font-size: 18px;
  color: #1d4f9c;
}

.world-clock__meta {
  font-size: 11px;
  color: #555;
  text-align: center;
}

.world-clock__dst {
  margin-left: 4px;
  padding: 0 4px;
  border-radius: 3px;
  color: #fff;
  background: #e08a00;
}

.world-clock__add .zone-select {
  max-width: 280px;
}

.world-clock__table {
  margin-top: 12px;
}
</style>
