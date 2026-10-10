<template>
  <div class="boot" :class="`boot--${stage}`" @click="skip">
    <div v-if="stage === 'chime'" class="boot__gray">
      <img :src="appleLogo" alt="" class="boot__apple">
      <img :src="spinner" :alt="$t('desktop.boot.starting')" class="boot__spinner">
    </div>

    <div v-else class="boot__panel pinstripe" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="boot__logo" />
      <div class="boot__name" />
      <div class="boot__progress-bg">
        <div class="boot__progress" :style="{ width: `${progress}%` }" />
      </div>
      <div class="boot__text">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script>
import { useSystemStore } from '../store/system'
import appleLogo from '../assets/macos-x-logo.png'
import spinner from '../assets/apple-loading.gif'

export default {
  name: 'BootScreen',
  data() {
    return {
      appleLogo,
      spinner,
      stage: 'chime',
      progress: 0,
      timers: []
    }
  },
  computed: {
    loadingText() {
      if (this.progress >= 100) return this.$t('desktop.boot.done')
      if (this.progress > 60) return this.$t('desktop.boot.resources')
      if (this.progress > 30) return this.$t('desktop.boot.network')
      if (this.progress > 1) return this.$t('desktop.boot.nose')
      return this.$t('desktop.boot.loading')
    }
  },
  mounted() {
    this.later(() => {
      this.stage = 'panel'
      const tick = setInterval(() => {
        this.progress = Math.min(100, this.progress + 4)
        if (this.progress === 100) {
          clearInterval(tick)
          this.later(this.finish, 350)
        }
      }, 80)
      this.timers.push(tick)
    }, 1400)
  },
  beforeUnmount() {
    this.timers.forEach(clearTimeout)
  },
  methods: {
    later(fn, delay) {
      this.timers.push(setTimeout(fn, delay))
    },
    skip() {
      this.finish()
    },
    finish() {
      useSystemStore().booted()
    }
  }
}
</script>

<style lang="scss">
.boot {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.boot--chime {
  background: #dedede;
}

.boot--panel {
  background: radial-gradient(ellipse at 50% 40%, #5c8fdc 0%, #2a5bb0 55%, #163a7c 100%);
}

.boot__gray {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
}

.boot__apple {
  width: 110px;
  height: 110px;
  filter: saturate(0) brightness(0.75) contrast(1.2);
}

.boot__spinner {
  width: 32px;
  height: 32px;
}

// The original itsblog loader panel
.boot__panel {
  position: relative;
  width: 480px;
  max-width: calc(100vw - 32px);
  height: 360px;
  border: 1px solid #000;
  box-shadow: 0 6px 16px #000;
}

.boot__logo {
  position: absolute;
  top: 38px;
  left: 50%;
  width: 86px;
  height: 86px;
  background: url('../assets/macos-x-logo.png') center / contain no-repeat;
  transform: translateX(-50%);
}

.boot__name {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 42px;
  background: url('../assets/loader-macosx.png') center / contain no-repeat;
  transform: translate(-50%, -50%);
}

.boot__progress-bg {
  position: absolute;
  top: 75%;
  left: 50%;
  width: 220px;
  height: 15px;
  overflow: hidden;
  background: url('../assets/loader-progress-bg.png') center no-repeat;
  box-shadow: 0 4px 8px grey;
  transform: translate(-50%, -50%);
}

.boot__progress {
  height: 100%;
  background: url('../assets/loader-progress.png') top left;
  transition: width 0.08s linear;
}

.boot__text {
  position: absolute;
  top: 85%;
  left: 0;
  right: 0;
  text-align: center;
  transform: translateY(-50%);
}
</style>
