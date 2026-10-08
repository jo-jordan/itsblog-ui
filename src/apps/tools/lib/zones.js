// IANA time zones through Intl: wall-clock parts, UTC offsets and DST.
import { pad } from './dates'

export const LOCAL_ZONE = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch (e) {
    return 'UTC'
  }
})()

// Used when the browser cannot list its zones
const FALLBACK_ZONES = [
  'UTC', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'America/Anchorage', 'America/Argentina/Buenos_Aires',
  'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Mexico_City', 'America/New_York', 'America/Sao_Paulo',
  'America/Toronto', 'America/Vancouver', 'Asia/Bangkok', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Jakarta', 'Asia/Kolkata',
  'Asia/Macau', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Taipei', 'Asia/Tehran', 'Asia/Tokyo', 'Asia/Urumqi',
  'Atlantic/Reykjavik', 'Australia/Adelaide', 'Australia/Perth', 'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Berlin',
  'Europe/Istanbul', 'Europe/London', 'Europe/Madrid', 'Europe/Moscow', 'Europe/Paris', 'Europe/Rome', 'Pacific/Auckland',
  'Pacific/Honolulu'
]

let zoneList = null

export function allZones() {
  if (!zoneList) {
    let zones = []
    try {
      zones = Intl.supportedValuesOf('timeZone')
    } catch (e) {
      zones = []
    }
    const set = new Set(zones.length ? zones : FALLBACK_ZONES)
    set.add('UTC')
    set.add(LOCAL_ZONE)
    zoneList = [...set].sort()
  }
  return zoneList
}

// Cities offered by the world clock, with Chinese names
export const CITIES = [
  { name: '北京', zone: 'Asia/Shanghai' },
  { name: '香港', zone: 'Asia/Hong_Kong' },
  { name: '台北', zone: 'Asia/Taipei' },
  { name: '东京', zone: 'Asia/Tokyo' },
  { name: '首尔', zone: 'Asia/Seoul' },
  { name: '新加坡', zone: 'Asia/Singapore' },
  { name: '曼谷', zone: 'Asia/Bangkok' },
  { name: '新德里', zone: 'Asia/Kolkata' },
  { name: '迪拜', zone: 'Asia/Dubai' },
  { name: '莫斯科', zone: 'Europe/Moscow' },
  { name: '伊斯坦布尔', zone: 'Europe/Istanbul' },
  { name: '开罗', zone: 'Africa/Cairo' },
  { name: '柏林', zone: 'Europe/Berlin' },
  { name: '巴黎', zone: 'Europe/Paris' },
  { name: '伦敦', zone: 'Europe/London' },
  { name: '雷克雅未克', zone: 'Atlantic/Reykjavik' },
  { name: '圣保罗', zone: 'America/Sao_Paulo' },
  { name: '纽约', zone: 'America/New_York' },
  { name: '多伦多', zone: 'America/Toronto' },
  { name: '芝加哥', zone: 'America/Chicago' },
  { name: '丹佛', zone: 'America/Denver' },
  { name: '旧金山', zone: 'America/Los_Angeles' },
  { name: '温哥华', zone: 'America/Vancouver' },
  { name: '檀香山', zone: 'Pacific/Honolulu' },
  { name: '奥克兰', zone: 'Pacific/Auckland' },
  { name: '悉尼', zone: 'Australia/Sydney' },
  { name: '珀斯', zone: 'Australia/Perth' },
  { name: '协调世界时', zone: 'UTC' }
]

export function cityName(zone) {
  const city = CITIES.find(item => item.zone === zone)
  if (city) {
    return city.name
  }
  return zone.split('/').pop().replace(/_/g, ' ')
}

export function isValidZone(zone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return true
  } catch (e) {
    return false
  }
}

const formatters = {}

function formatter(zone) {
  if (!formatters[zone]) {
    formatters[zone] = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      era: 'short'
    })
  }
  return formatters[zone]
}

// Wall-clock fields of an instant in a zone: { y, m, d, h, mi, s }
export function zoneParts(epoch, zone) {
  const parts = {}
  formatter(zone).formatToParts(new Date(epoch)).forEach(part => {
    parts[part.type] = part.value
  })
  const year = +parts.year
  return {
    y: parts.era && /^B/.test(parts.era) ? 1 - year : year,
    m: +parts.month,
    d: +parts.day,
    h: +parts.hour % 24,
    mi: +parts.minute,
    s: +parts.second
  }
}

function wallAsUtc(parts) {
  const js = new Date(0)
  js.setUTCFullYear(parts.y, parts.m - 1, parts.d)
  js.setUTCHours(parts.h, parts.mi, parts.s || 0, 0)
  return js.getTime()
}

// Offset of the zone from UTC at an instant, in minutes (Shanghai = +480)
export function zoneOffset(epoch, zone) {
  const whole = Math.floor(epoch / 1000) * 1000
  return Math.round((wallAsUtc(zoneParts(whole, zone)) - whole) / 60000)
}

// Instant at which a zone's clocks show the given wall time. `valid` is false
// for a time skipped by a DST change; repeated times resolve to the earlier one.
export function zonedToEpoch(parts, zone) {
  const guess = wallAsUtc(parts)
  const first = guess - zoneOffset(guess, zone) * 60000
  const second = guess - zoneOffset(first, zone) * 60000
  const candidates = [first, second, guess - zoneOffset(guess - 86400000, zone) * 60000, guess - zoneOffset(guess + 86400000, zone) * 60000]
  const exact = candidates.filter(epoch => wallAsUtc(zoneParts(epoch, zone)) === wallAsUtc({ ...parts, s: parts.s || 0 }))
  if (exact.length) {
    return { epoch: Math.min(...exact), valid: true }
  }
  return { epoch: second, valid: false }
}

export function formatOffset(minutes) {
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)
  return `UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

// Whether daylight saving time is in force: the offset is above the year's standard (lowest) offset
export function isDst(epoch, zone) {
  const year = zoneParts(epoch, zone).y
  const jan = zoneOffset(Date.UTC(year, 0, 1), zone)
  const jul = zoneOffset(Date.UTC(year, 6, 1), zone)
  return jan !== jul && zoneOffset(epoch, zone) > Math.min(jan, jul)
}

export function observesDst(epoch, zone) {
  const year = zoneParts(epoch, zone).y
  return zoneOffset(Date.UTC(year, 0, 1), zone) !== zoneOffset(Date.UTC(year, 6, 1), zone)
}

export function formatParts(parts, withSeconds = true) {
  const time = `${pad(parts.h)}:${pad(parts.mi)}${withSeconds ? `:${pad(parts.s)}` : ''}`
  return `${pad(parts.y, 4)}-${pad(parts.m)}-${pad(parts.d)} ${time}`
}
