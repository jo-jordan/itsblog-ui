<template>
  <transition name="power-fade">
    <div v-if="power === 'sleep' || power === 'off'" class="power" :class="`power--${power}`" @click="wake">
      <button v-if="power === 'off'" type="button" class="power__button" aria-label="开机">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v9" />
          <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
        </svg>
        <span>按下电源键开机</span>
      </button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PowerOverlay',
  computed: {
    power() {
      return this.$store.state.system.power
    }
  },
  watch: {
    power(value) {
      // Any key wakes a sleeping Mac
      if (value === 'sleep') {
        setTimeout(() => document.addEventListener('keydown', this.wake, { once: true }), 300)
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.wake)
  },
  methods: {
    wake() {
      document.removeEventListener('keydown', this.wake)
      if (this.power === 'sleep') {
        this.$store.dispatch('system/wake')
      } else if (this.power === 'off') {
        this.$store.dispatch('system/restart')
      }
    }
  }
}
</script>

<style lang="scss">
.power {
  position: fixed;
  inset: 0;
  z-index: 19000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  cursor: default;
}

.power__button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  border: 0;
  font: inherit;
  font-size: 13px;
  color: #555;
  background: none;
  cursor: default;

  svg {
    width: 44px;
    height: 44px;
    fill: none;
    stroke: #555;
    stroke-width: 2;
    stroke-linecap: round;
  }

  &:hover svg {
    stroke: #8bb8ff;
    filter: drop-shadow(0 0 6px rgba(120, 170, 255, 0.8));
  }
}

.power-fade-enter-active {
  transition: opacity 1.2s;
}

.power-fade-leave-active {
  transition: opacity 0.4s;
}

.power-fade-enter,
.power-fade-leave-to {
  opacity: 0;
}
</style>
