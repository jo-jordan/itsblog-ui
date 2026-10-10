<template>
  <select :value="modelValue" class="aqua-popup zone-select" :aria-label="label || $t('tools.zones.label')" @change="$emit('update:modelValue', $event.target.value)">
    <optgroup :label="$t('tools.zones.popular')">
      <option v-for="city in cities" :key="`c-${city.zone}`" :value="city.zone">{{ $t('tools.zones.cityOption', city) }}</option>
    </optgroup>
    <optgroup :label="$t('tools.zones.all')">
      <option v-for="zone in zones" :key="zone" :value="zone">{{ zone === localZone ? $t('tools.zones.localOption', { zone }) : zone }}</option>
    </optgroup>
  </select>
</template>

<script>
import { allZones, cities, LOCAL_ZONE } from './lib/zones'

// IANA time zone picker: well-known cities first, then every zone the browser knows
export default {
  name: 'ZoneSelect',
  props: {
    modelValue: { type: String, required: true },
    // Accessible name; "Time zone" in the current language when empty
    label: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      zones: allZones(),
      localZone: LOCAL_ZONE
    }
  },
  computed: {
    cities() {
      return cities()
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
