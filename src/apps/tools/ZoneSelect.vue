<template>
  <select :value="value" class="aqua-popup zone-select" :aria-label="label" @change="$emit('input', $event.target.value)">
    <optgroup label="常用城市">
      <option v-for="city in cities" :key="`c-${city.zone}`" :value="city.zone">{{ city.name }}（{{ city.zone }}）</option>
    </optgroup>
    <optgroup label="全部时区">
      <option v-for="zone in zones" :key="zone" :value="zone">{{ zone }}{{ zone === localZone ? '（本机）' : '' }}</option>
    </optgroup>
  </select>
</template>

<script>
import { allZones, CITIES, LOCAL_ZONE } from './lib/zones'

// IANA time zone picker: Chinese city names first, then every zone the browser knows
export default {
  name: 'ZoneSelect',
  props: {
    value: { type: String, required: true },
    label: { type: String, default: '时区' }
  },
  data() {
    return {
      cities: CITIES,
      zones: allZones(),
      localZone: LOCAL_ZONE
    }
  }
}
</script>

<style lang="scss">
.zone-select {
  width: 340px;
  max-width: 100%;
  min-width: 0;
}
</style>
