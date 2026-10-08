<template>
  <div class="tool timers">
    <div class="tool-bar">
      <div class="aqua-segmented" role="tablist" aria-label="模式">
        <button
          v-for="item in modes"
          :key="item.id"
          type="button"
          role="tab"
          :class="{ 'is-selected': mode === item.id }"
          :aria-selected="mode === item.id ? 'true' : 'false'"
          @click="mode = item.id"
        >
          {{ item.label }}<span v-if="item.running" class="timers__dot" aria-label="（运行中）" />
        </button>
      </div>
    </div>

    <!-- Stopwatch -->
    <section v-show="mode === 'stopwatch'" role="tabpanel" aria-label="秒表">
      <div class="timers__lcd" role="timer" aria-live="off">{{ stopwatchText }}</div>
      <div class="timers__buttons">
        <button type="button" class="aqua-button" :class="{ 'aqua-button--default': !stopwatch.running }" @click="toggleStopwatch">
          {{ stopwatch.running ? '停止' : stopwatchElapsed ? '继续' : '开始' }}
        </button>
        <button type="button" class="aqua-button" :disabled="!stopwatch.running && !stopwatchElapsed" @click="stopwatch.running ? lap() : resetStopwatch()">
          {{ stopwatch.running ? '计次' : '复位' }}
        </button>
      </div>
      <div v-if="laps.length" class="tool-table__wrap">
        <table class="tool-table timers__laps">
          <thead>
            <tr><th>计次</th><th>单次用时</th><th>累计</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in laps" :key="item.index">
              <td>第 {{ item.index }} 次</td>
              <td :class="{ 'tool-good': item.fastest, 'tool-bad': item.slowest }">{{ item.split }}{{ item.fastest ? '（最快）' : item.slowest ? '（最慢）' : '' }}</td>
              <td>{{ item.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Countdown -->
    <section v-show="mode === 'countdown'" role="tabpanel" aria-label="倒计时">
      <div class="timers__lcd" :class="{ 'is-done': countdown.done }" role="timer">{{ countdown.done ? '时间到！' : countdownText }}</div>
      <div class="aqua-progress timers__progress"><div class="aqua-progress__bar" :style="{ width: `${countdownProgress}%` }" /></div>
      <div class="timers__presets" role="group" aria-label="预设时长">
        <button v-for="minutes in presets" :key="minutes" type="button" class="aqua-button" :disabled="countdown.running" @click="setCountdown(minutes * 60)">
          {{ minutes < 60 ? `${minutes} 分钟` : `${minutes / 60} 小时` }}
        </button>
      </div>
      <div class="tool-inline timers__custom">
        <span>自定义：</span>
        <label class="tool-inline"><input v-model.number="custom.h" type="number" min="0" max="99" class="aqua-field timers__field" :disabled="countdown.running" aria-label="小时"> 时</label>
        <label class="tool-inline"><input v-model.number="custom.m" type="number" min="0" max="59" class="aqua-field timers__field" :disabled="countdown.running" aria-label="分"> 分</label>
        <label class="tool-inline"><input v-model.number="custom.s" type="number" min="0" max="59" class="aqua-field timers__field" :disabled="countdown.running" aria-label="秒"> 秒</label>
        <button type="button" class="aqua-button" :disabled="countdown.running || !customSeconds" @click="setCountdown(customSeconds)">设定</button>
      </div>
      <div class="timers__buttons">
        <button type="button" class="aqua-button" :class="{ 'aqua-button--default': !countdown.running }" :disabled="!countdown.duration" @click="toggleCountdown">
          {{ countdown.running ? '暂停' : countdown.remaining < countdown.duration && !countdown.done ? '继续' : '开始' }}
        </button>
        <button type="button" class="aqua-button" @click="resetCountdown">复位</button>
      </div>
    </section>

    <!-- Pomodoro -->
    <section v-show="mode === 'pomodoro'" role="tabpanel" aria-label="番茄钟">
      <p class="timers__phase" :class="`is-${pomodoro.phase}`">{{ pomodoro.phase === 'work' ? '专注' : '休息' }}</p>
      <div class="timers__lcd" role="timer">{{ pomodoroText }}</div>
      <div class="aqua-progress timers__progress"><div class="aqua-progress__bar" :style="{ width: `${pomodoroProgress}%` }" /></div>
      <div class="timers__buttons">
        <button type="button" class="aqua-button" :class="{ 'aqua-button--default': !pomodoro.running }" @click="togglePomodoro">
          {{ pomodoro.running ? '暂停' : pomodoro.remaining < phaseLength(pomodoro.phase) ? '继续' : '开始' }}
        </button>
        <button type="button" class="aqua-button" @click="nextPhase(false)">跳过</button>
        <button type="button" class="aqua-button" @click="resetPomodoro">复位</button>
      </div>
      <p class="timers__tomatoes">
        已完成 <strong>{{ pomodoro.completed }}</strong> 个番茄
        <span v-for="n in Math.min(pomodoro.completed, 12)" :key="n" class="timers__tomato" aria-hidden="true" />
      </p>
      <p class="tool-hint">专注 25 分钟，休息 5 分钟，交替进行；每段结束时会响铃提醒。</p>
    </section>

    <p class="tool-hint">{{ notifyHint }}</p>
  </div>
</template>

<script>
import { pad } from './lib/dates'

const WORK = 25 * 60 * 1000
const BREAK = 5 * 60 * 1000

function clock(ms, withCentiseconds) {
  const total = Math.max(0, ms)
  const hours = Math.floor(total / 3600000)
  const minutes = Math.floor((total % 3600000) / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  const head = hours ? `${hours}:${pad(minutes)}` : pad(minutes)
  return withCentiseconds ? `${head}:${pad(seconds)}.${pad(Math.floor((total % 1000) / 10))}` : `${head}:${pad(seconds)}`
}

export default {
  // keep-alive in the toolbox keeps this component (and its timers) alive across tools
  name: 'ToolTimers',
  props: {
    params: { type: Object, default: null }
  },
  data() {
    return {
      mode: 'stopwatch',
      now: Date.now(),
      ticker: null,
      audio: null,
      presets: [1, 3, 5, 10, 15, 30, 60],
      stopwatch: { running: false, startedAt: 0, banked: 0, laps: [] },
      countdown: { running: false, duration: 5 * 60 * 1000, remaining: 5 * 60 * 1000, endsAt: 0, done: false },
      custom: { h: 0, m: 20, s: 0 },
      pomodoro: { running: false, phase: 'work', remaining: WORK, endsAt: 0, completed: 0 },
      permission: typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
    }
  },
  computed: {
    modes() {
      return [
        { id: 'stopwatch', label: '秒表', running: this.stopwatch.running },
        { id: 'countdown', label: '倒计时', running: this.countdown.running },
        { id: 'pomodoro', label: '番茄钟', running: this.pomodoro.running }
      ]
    },
    anyRunning() {
      return this.stopwatch.running || this.countdown.running || this.pomodoro.running
    },
    stopwatchElapsed() {
      return this.stopwatch.banked + (this.stopwatch.running ? this.now - this.stopwatch.startedAt : 0)
    },
    stopwatchText() {
      return clock(this.stopwatchElapsed, true)
    },
    laps() {
      const laps = this.stopwatch.laps.map((total, i, all) => ({ index: i + 1, total, split: total - (i ? all[i - 1] : 0) }))
      const splits = laps.map(item => item.split)
      const fastest = Math.min(...splits)
      const slowest = Math.max(...splits)
      return laps
        .map(item => ({
          index: item.index,
          total: clock(item.total, true),
          split: clock(item.split, true),
          fastest: laps.length > 1 && item.split === fastest,
          slowest: laps.length > 1 && item.split === slowest
        }))
        .reverse()
    },
    countdownLeft() {
      return this.countdown.running ? this.countdown.endsAt - this.now : this.countdown.remaining
    },
    countdownText() {
      // Round up so the display reaches 00:00 exactly when time is up
      return clock(Math.ceil(this.countdownLeft / 1000) * 1000, false)
    },
    countdownProgress() {
      return this.countdown.duration ? (1 - Math.max(0, this.countdownLeft) / this.countdown.duration) * 100 : 0
    },
    customSeconds() {
      const { h, m, s } = this.custom
      const total = (h || 0) * 3600 + (m || 0) * 60 + (s || 0)
      return Number.isFinite(total) && total > 0 ? total : 0
    },
    pomodoroLeft() {
      return this.pomodoro.running ? this.pomodoro.endsAt - this.now : this.pomodoro.remaining
    },
    pomodoroText() {
      return clock(Math.ceil(this.pomodoroLeft / 1000) * 1000, false)
    },
    pomodoroProgress() {
      return (1 - Math.max(0, this.pomodoroLeft) / this.phaseLength(this.pomodoro.phase)) * 100
    },
    notifyHint() {
      if (this.permission === 'granted') {
        return '倒计时和番茄钟结束时会响铃并显示系统通知，切换到其他工具时也会继续计时。'
      }
      if (this.permission === 'denied') {
        return '浏览器已禁止通知，结束时只会响铃。'
      }
      return '开始倒计时或番茄钟时会请求通知权限；允许后结束时会弹出系统通知。'
    }
  },
  watch: {
    anyRunning(running) {
      clearInterval(this.ticker)
      this.ticker = running ? setInterval(this.tick, 33) : null
      this.now = Date.now()
    }
  },
  beforeDestroy() {
    clearInterval(this.ticker)
    if (this.audio) {
      this.audio.close().catch(() => {})
    }
  },
  methods: {
    tick() {
      this.now = Date.now()
      if (this.countdown.running && this.now >= this.countdown.endsAt) {
        this.countdown.running = false
        this.countdown.remaining = 0
        this.countdown.done = true
        this.alarm('倒计时结束', `${clock(this.countdown.duration, false)} 的倒计时到了。`)
      }
      if (this.pomodoro.running && this.now >= this.pomodoro.endsAt) {
        this.nextPhase(true)
      }
    },

    // ---- Stopwatch
    toggleStopwatch() {
      const sw = this.stopwatch
      if (sw.running) {
        sw.banked += Date.now() - sw.startedAt
        sw.running = false
      } else {
        sw.startedAt = Date.now()
        sw.running = true
      }
    },
    lap() {
      this.stopwatch.laps.push(this.stopwatch.banked + Date.now() - this.stopwatch.startedAt)
    },
    resetStopwatch() {
      this.stopwatch = { running: false, startedAt: 0, banked: 0, laps: [] }
    },

    // ---- Countdown
    setCountdown(seconds) {
      this.countdown = { running: false, duration: seconds * 1000, remaining: seconds * 1000, endsAt: 0, done: false }
    },
    toggleCountdown() {
      const cd = this.countdown
      if (cd.running) {
        cd.remaining = Math.max(0, cd.endsAt - Date.now())
        cd.running = false
        return
      }
      if (cd.done || cd.remaining <= 0) {
        cd.remaining = cd.duration
        cd.done = false
      }
      this.prepareAlerts()
      cd.endsAt = Date.now() + cd.remaining
      cd.running = true
    },
    resetCountdown() {
      this.setCountdown(this.countdown.duration / 1000)
    },

    // ---- Pomodoro
    phaseLength(phase) {
      return phase === 'work' ? WORK : BREAK
    },
    togglePomodoro() {
      const p = this.pomodoro
      if (p.running) {
        p.remaining = Math.max(0, p.endsAt - Date.now())
        p.running = false
        return
      }
      this.prepareAlerts()
      p.endsAt = Date.now() + p.remaining
      p.running = true
    },
    // Finished (or skipped) phase → the other one; a finished phase starts the next automatically
    nextPhase(finished) {
      const p = this.pomodoro
      const wasWork = p.phase === 'work'
      if (finished) {
        if (wasWork) {
          p.completed++
        }
        this.alarm(wasWork ? '专注结束' : '休息结束', wasWork ? '休息 5 分钟吧。' : '开始下一个 25 分钟的专注。')
      }
      p.phase = wasWork ? 'break' : 'work'
      p.remaining = this.phaseLength(p.phase)
      p.endsAt = Date.now() + p.remaining
      p.running = finished || p.running
    },
    resetPomodoro() {
      this.pomodoro = { running: false, phase: 'work', remaining: WORK, endsAt: 0, completed: this.pomodoro.completed }
    },

    // ---- Alerts
    // Called from a click, so the browser lets us create audio and ask for notifications
    prepareAlerts() {
      try {
        if (!this.audio) {
          const AudioContext = window.AudioContext || window.webkitAudioContext
          this.audio = AudioContext ? new AudioContext() : null
        }
        if (this.audio && this.audio.state === 'suspended') {
          this.audio.resume()
        }
      } catch (e) {
        this.audio = null
      }
      if (this.permission === 'default') {
        try {
          Promise.resolve(Notification.requestPermission()).then(result => {
            this.permission = result
          }).catch(() => {})
        } catch (e) {
          // Older browsers without the promise form
        }
      }
    },
    alarm(title, body) {
      this.beep()
      if (this.permission === 'granted') {
        try {
          new Notification(title, { body, tag: 'itsblog-timer' })
        } catch (e) {
          // Some browsers only allow notifications from a service worker
        }
      }
    },
    // Three short Aqua-ish "glass" beeps
    beep() {
      const ctx = this.audio
      if (!ctx) {
        return
      }
      const start = ctx.currentTime + 0.05
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const t = start + i * 0.32
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1318.5, t)
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.22)
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
        osc.connect(gain).connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.28)
      }
    }
  }
}
</script>

<style lang="scss">
.timers {
  section {
    max-width: 520px;
  }
}

.timers__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 5px;
  border-radius: 50%;
  vertical-align: 1px;
  background: #1a7f2b;
}

// iTunes-style status display
.timers__lcd {
  margin: 4px 0 12px;
  padding: 10px 14px;
  border: 1px solid #8e9478;
  border-radius: 9px;
  font-family: 'Lucida Grande', Monaco, Menlo, monospace;
  font-size: 46px;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  text-align: center;
  color: #23281a;
  background: linear-gradient(to bottom, #f6f8ec, #e2e7cf 55%, #d6dcc0);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.8);

  &.is-done {
    color: #b8170e;
    animation: timers-blink 1s steps(2, start) infinite;
  }
}

@keyframes timers-blink {
  to { visibility: hidden; }
}

.timers__progress {
  margin-bottom: 12px;
}

.timers__buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;

  .aqua-button {
    min-width: 88px;
  }
}

.timers__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;

  .aqua-button {
    min-width: 0;
    font-size: 12px;
  }
}

.timers__custom {
  margin-bottom: 14px;
}

.timers__field {
  width: 52px;
}

.timers__laps {
  max-width: 520px;
}

.timers__phase {
  display: inline-block;
  margin: 0 0 4px;
  padding: 1px 10px;
  border-radius: 9px;
  font-size: 12px;
  color: #fff;

  &.is-work {
    background: linear-gradient(to bottom, #e0453a, #b8170e);
  }

  &.is-break {
    background: linear-gradient(to bottom, #4fb54a, #2a8526);
  }
}

.timers__tomatoes {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.timers__tomato {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff9a8c, #d42a1e 60%, #9c120c);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .timers__lcd.is-done {
    animation: none;
  }
}
</style>
