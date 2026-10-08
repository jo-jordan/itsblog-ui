<template>
  <svg viewBox="0 0 100 100" class="analog-clock" :class="{ 'is-night': night }" role="img" :aria-label="label">
    <defs>
      <linearGradient :id="`${uid}-rim`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fdfdfd" />
        <stop offset="0.5" stop-color="#b9c1ca" />
        <stop offset="1" stop-color="#7d8792" />
      </linearGradient>
      <radialGradient :id="`${uid}-face`" cx="0.5" cy="0.4" r="0.65">
        <stop offset="0" :stop-color="night ? '#3a475c' : '#ffffff'" />
        <stop offset="1" :stop-color="night ? '#121822' : '#dde6f1'" />
      </radialGradient>
      <linearGradient :id="`${uid}-gloss`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.85" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" :fill="`url(#${uid}-rim)`" stroke="#5f6873" stroke-width="1" />
    <circle cx="50" cy="50" r="42" :fill="`url(#${uid}-face)`" stroke="#6b737d" stroke-width="0.8" />
    <g :stroke="night ? '#c9d4e3' : '#333'" stroke-linecap="round">
      <line v-for="tick in ticks" :key="tick.angle" x1="50" :y1="tick.major ? 11 : 10" x2="50" :y2="tick.major ? 16 : 12.5" :stroke-width="tick.major ? 2 : 0.7" :transform="`rotate(${tick.angle} 50 50)`" />
    </g>
    <g :fill="night ? '#e7edf6' : '#222'" font-size="8" font-family="Lucida Grande, Helvetica, sans-serif" text-anchor="middle">
      <text v-for="n in numerals" :key="n.label" :x="n.x" :y="n.y" dominant-baseline="central">{{ n.label }}</text>
    </g>
    <g stroke-linecap="round">
      <line x1="50" y1="54" x2="50" y2="29" :stroke="night ? '#f2f5f9' : '#111'" stroke-width="3.6" :transform="`rotate(${hourAngle} 50 50)`" />
      <line x1="50" y1="56" x2="50" y2="17" :stroke="night ? '#f2f5f9' : '#111'" stroke-width="2.4" :transform="`rotate(${minuteAngle} 50 50)`" />
      <g :transform="`rotate(${secondAngle} 50 50)`">
        <line x1="50" y1="60" x2="50" y2="13" stroke="#d42a1e" stroke-width="1" />
        <circle cx="50" cy="50" r="2.4" fill="#d42a1e" />
      </g>
    </g>
    <ellipse cx="50" cy="30" rx="33" ry="20" :fill="`url(#${uid}-gloss)`" opacity="0.55" />
  </svg>
</template>

<script>
// A round Mac OS X style clock face; dark at night
export default {
  name: 'AnalogClock',
  props: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    seconds: { type: Number, required: true },
    label: { type: String, default: '' }
  },
  data() {
    return {
      uid: `clock-${this._uid}`,
      ticks: Array.from({ length: 60 }, (_, i) => ({ angle: i * 6, major: i % 5 === 0 })),
      numerals: Array.from({ length: 12 }, (_, i) => {
        const angle = ((i + 1) * 30 * Math.PI) / 180
        return { label: i + 1, x: 50 + 27 * Math.sin(angle), y: 50 - 27 * Math.cos(angle) }
      })
    }
  },
  computed: {
    night() {
      return this.hours < 6 || this.hours >= 18
    },
    hourAngle() {
      return (this.hours % 12) * 30 + this.minutes * 0.5
    },
    minuteAngle() {
      return this.minutes * 6 + this.seconds * 0.1
    },
    secondAngle() {
      return this.seconds * 6
    }
  }
}
</script>

<style lang="scss">
.analog-clock {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
}
</style>
