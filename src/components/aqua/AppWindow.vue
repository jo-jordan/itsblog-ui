<template>
  <section
    v-show="!win.minimized || animating"
    class="aqua-window"
    :class="{ 'is-inactive': !focused, 'is-dialog': app.dialog, 'is-compact': compact }"
    :style="[frameStyle, { visibility: genieHidden ? 'hidden' : null }]"
    role="dialog"
    :aria-label="title"
    @pointerdown.capture="focus"
  >
    <header class="aqua-window__titlebar pinstripe" @pointerdown="startDrag" @dblclick="onTitleDoubleClick">
      <div class="traffic-lights" @pointerdown.stop @dblclick.stop @pointerenter="prefetchSnapshot">
        <button type="button" class="traffic-light traffic-light--close" :aria-label="$t('desktop.window.close')" @click="close">
          <span aria-hidden="true">×</span>
        </button>
        <button v-if="!app.dialog" type="button" class="traffic-light traffic-light--minimize" :aria-label="$t('desktop.window.minimize')" @click="minimize">
          <span aria-hidden="true">−</span>
        </button>
        <button v-if="!app.dialog" type="button" class="traffic-light traffic-light--zoom" :aria-label="$t('desktop.window.zoom')" @click="zoom">
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <h2 class="aqua-window__title">
        <img :src="app.icon" alt="" class="aqua-window__icon">
        {{ title }}
      </h2>
    </header>

    <div class="aqua-window__body">
      <component :is="app.component" :win="win" :focused="focused" @title="customTitle = $event" />
    </div>

    <div v-if="resizable" class="aqua-window__grow" aria-hidden="true" @pointerdown.stop="startResize" />
  </section>
</template>

<script>
import { useSystemStore } from '../../store/system'
import { useWindowsStore } from '../../store/windows'
import { apps } from '../../apps/registry'
import { animateMinimize, snapshot } from '../../utils/genie'
import { viewport } from '../../utils/viewport'

export default {
  name: 'AppWindow',
  props: {
    win: { type: Object, required: true }
  },
  data() {
    return {
      // Set by the application; windows without one are named after it
      customTitle: null,
      animating: false,
      // The real window hides while the genie canvas draws its picture
      genieHidden: false,
      picture: null,
      prefetch: null,
      gesture: null
    }
  },
  computed: {
    app() {
      return apps[this.win.appId]
    },
    title() {
      return this.customTitle || this.app.name
    },
    focused() {
      return useWindowsStore().focusedId === this.win.id
    },
    compact() {
      return viewport.compact && !this.app.dialog
    },
    resizable() {
      return this.app.resizable !== false && !this.compact
    },
    frameStyle() {
      if (this.compact) {
        return { zIndex: this.win.z }
      }
      return {
        left: `${this.win.x}px`,
        top: `${this.win.y}px`,
        width: `${this.win.width}px`,
        height: `${this.win.height}px`,
        zIndex: this.win.z
      }
    }
  },
  watch: {
    // Runs before the re-render: the window is still visible when minimising,
    // and the Dock tile still exists when restoring, so it is measured now.
    async 'win.minimized'(minimized) {
      const effect = useSystemStore().prefs.minimizeEffect
      const restoreTile = minimized ? null : this.dockTarget()
      this.animating = true
      if (!minimized && effect === 'genie') {
        this.genieHidden = true
      }
      await this.$nextTick()
      let picture = null
      if (effect === 'genie') {
        picture = minimized ? await this.takeSnapshot() : this.picture || await snapshot(this.$el)
      }
      // The new Dock tile only exists after the re-render
      const tile = minimized ? this.dockTarget() : restoreTile
      await animateMinimize(this.$el, tile, {
        effect,
        reverse: !minimized,
        picture,
        hide: hidden => {
          this.genieHidden = hidden
        }
      })
      this.genieHidden = false
      this.animating = false
      // Keep the picture while minimised so restoring can start instantly
      this.picture = minimized ? picture : null
    }
  },
  beforeUnmount() {
    this.endGesture()
  },
  methods: {
    focus() {
      if (!this.focused) {
        useWindowsStore().focus(this.win.id)
      }
    },
    close() {
      useWindowsStore().close(this.win.id)
    },
    minimize() {
      useWindowsStore().minimize(this.win.id)
    },
    zoom() {
      if (!this.compact) {
        useWindowsStore().toggleZoom(this.win.id)
      }
    },
    onTitleDoubleClick() {
      // Double-clicking the title bar minimises, as in Mac OS X
      if (!this.app.dialog) {
        this.minimize()
      }
    },
    // Start photographing the window as soon as the pointer nears its buttons
    prefetchSnapshot() {
      if (!this.app.dialog && useSystemStore().prefs.minimizeEffect === 'genie' && !this.freshPrefetch()) {
        this.prefetch = { at: Date.now(), promise: snapshot(this.$el) }
      }
    },
    freshPrefetch() {
      return this.prefetch && Date.now() - this.prefetch.at < 2000
    },
    takeSnapshot() {
      const promise = this.freshPrefetch() ? this.prefetch.promise : snapshot(this.$el)
      this.prefetch = null
      return promise
    },
    dockTarget() {
      const el = document.querySelector(`[data-dock-window="${this.win.id}"]`) ||
        document.querySelector(`[data-dock-app="${this.win.appId}"]`)
      return el ? el.getBoundingClientRect() : null
    },
    startDrag(event) {
      if (this.compact || event.button !== 0) {
        return
      }
      this.beginGesture(event, 'move', { x: this.win.x, y: this.win.y })
    },
    startResize(event) {
      this.focus()
      this.beginGesture(event, 'resize', { width: this.win.width, height: this.win.height })
    },
    beginGesture(event, type, origin) {
      event.preventDefault()
      this.gesture = { type, origin, startX: event.clientX, startY: event.clientY }
      window.addEventListener('pointermove', this.onGesture)
      window.addEventListener('pointerup', this.endGesture)
      window.addEventListener('pointercancel', this.endGesture)
    },
    onGesture(event) {
      const { type, origin, startX, startY } = this.gesture
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (type === 'move') {
        useWindowsStore().move({ id: this.win.id, x: origin.x + dx, y: origin.y + dy })
      } else {
        useWindowsStore().resize({ id: this.win.id, width: origin.width + dx, height: origin.height + dy })
      }
    },
    endGesture() {
      this.gesture = null
      window.removeEventListener('pointermove', this.onGesture)
      window.removeEventListener('pointerup', this.endGesture)
      window.removeEventListener('pointercancel', this.endGesture)
    }
  }
}
</script>

<style lang="scss">
.aqua-window {
  position: fixed;
  display: flex;
  flex-direction: column;
  min-width: 240px;
  border: 1px solid rgba(0, 0, 0, 0.55);
  border-radius: 7px 7px 0 0;
  background: var(--aqua-pinstripe) top left;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55), 0 0 0 0.5px rgba(0, 0, 0, 0.2);
  overflow: hidden;

  &.is-inactive {
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.35);

    .aqua-window__title {
      color: #8a8a8a;
    }

    .traffic-light {
      filter: saturate(0) brightness(1.15) opacity(0.7);
    }
  }

  &.is-dialog {
    border-radius: 7px;
  }

  // Phones: every window fills the space between the menu bar and the Dock
  &.is-compact {
    left: 0;
    top: var(--menubar-height);
    width: 100%;
    height: calc(100% - var(--menubar-height) - 64px);
    border-radius: 0;
  }
}

.aqua-window__titlebar {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
  cursor: default;
  touch-action: none;
}

.traffic-lights {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 7px;

  &:hover .traffic-light span {
    opacity: 1;
  }
}

.traffic-light {
  width: 13px;
  height: 13px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent center / 13px 13px no-repeat;
  filter: var(--traffic-filter);
  cursor: default;

  span {
    display: block;
    font: bold 10px/13px var(--aqua-font);
    color: rgba(70, 0, 0, 0.75);
    opacity: 0;
  }

  &:active {
    filter: var(--traffic-filter) brightness(0.8);
  }

  &:focus-visible {
    outline: 2px solid rgba(61, 128, 223, 0.8);
    outline-offset: 1px;
  }
}

.traffic-light--close { background-image: url('../../assets/action-close.png'); }
.traffic-light--minimize { background-image: url('../../assets/action-min.png'); }
.traffic-light--zoom { background-image: url('../../assets/action-max.png'); }

.aqua-window__title {
  position: absolute;
  left: 76px;
  right: 76px;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: normal;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #000;
}

.aqua-window__icon {
  width: 14px;
  height: 14px;
  margin-right: 3px;
  vertical-align: -2px;
}

.aqua-window__body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.aqua-window__grow {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 15px;
  height: 15px;
  cursor: nwse-resize;
  touch-action: none;
  background: linear-gradient(135deg, transparent 0 55%, #8d8d8d 55% 60%, transparent 60% 70%, #8d8d8d 70% 75%, transparent 75% 85%, #8d8d8d 85% 90%, transparent 90%);
}
</style>
