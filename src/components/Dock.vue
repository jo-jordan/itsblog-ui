<template>
  <nav class="dock" :class="{ 'is-compact': compact }" aria-label="Dock" @mousemove="onMouseMove" @mouseleave="pointerX = null">
    <div class="dock__shelf">
      <template v-for="(item, index) in items">
        <div v-if="item.separator" :key="item.key" class="dock__separator" role="separator" />
        <button
          v-else
          :key="item.key"
          type="button"
          class="dock__item"
          :class="{ 'is-bouncing': launching.includes(item.appId) }"
          :style="sizeStyle(index)"
          :aria-label="item.label"
          :data-dock-app="item.appId && !item.windowId ? item.appId : null"
          :data-dock-window="item.windowId || null"
          @click="activate(item)"
        >
          <span class="dock__label">{{ item.label }}</span>
          <img :src="item.icon" alt="" class="dock__icon" draggable="false">
          <img v-if="item.windowId" :src="windowBadge" alt="" class="dock__badge" draggable="false">
          <img v-if="item.running" :src="indicator" alt="" class="dock__indicator" draggable="false">
        </button>
      </template>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { apps, dockApps } from '../apps/registry'
import { viewport } from '../utils/viewport'
import indicator from '../assets/macos-x-indicator.png'
import trashIcon from '../assets/icons/trash.svg'
import windowBadge from '../assets/icons/document.svg'

const BASE = 52
const COMPACT_BASE = 40
const MAX_SCALE = 1.7
const RANGE = 150
const GAP = 6

export default {
  name: 'Dock',
  data() {
    return {
      pointerX: null,
      launching: [],
      indicator,
      windowBadge
    }
  },
  computed: {
    ...mapState('windows', ['windows']),
    ...mapGetters('windows', ['runningAppIds', 'minimized']),
    compact() {
      return viewport.compact
    },
    magnify() {
      return this.$store.state.system.prefs.magnification && !this.compact
    },
    items() {
      const appItems = dockApps.map(appId => ({
        key: appId,
        appId,
        label: apps[appId].name,
        icon: apps[appId].icon,
        running: this.runningAppIds.includes(appId)
      }))
      const minimizedItems = this.minimized.map(win => ({
        key: `window-${win.id}`,
        appId: win.appId,
        windowId: win.id,
        label: `${apps[win.appId].name} 窗口`,
        icon: apps[win.appId].icon
      }))
      return [
        ...appItems,
        { key: 'separator', separator: true },
        ...minimizedItems,
        { key: 'trash', trash: true, label: '废纸篓', icon: trashIcon }
      ]
    }
  },
  methods: {
    // Fisheye magnification measured against the un-magnified layout
    sizeStyle(index) {
      const base = this.compact ? COMPACT_BASE : BASE
      let scale = 1
      if (this.magnify && this.pointerX !== null) {
        const count = this.items.length
        const center = (index - (count - 1) / 2) * (base + GAP)
        const distance = Math.abs(this.pointerX - center)
        if (distance < RANGE) {
          scale = 1 + (MAX_SCALE - 1) * Math.cos((distance / RANGE) * Math.PI / 2)
        }
      }
      const size = Math.round(base * scale)
      return { width: `${size}px`, height: `${size}px` }
    },
    onMouseMove(event) {
      this.pointerX = event.clientX - viewport.width / 2
    },
    activate(item) {
      if (item.trash) {
        this.$store.dispatch('windows/open', { appId: 'finder', props: { location: 'trash' } })
      } else if (item.windowId) {
        this.$store.dispatch('windows/restore', item.windowId)
      } else {
        this.activateApp(item.appId)
      }
    },
    activateApp(appId) {
      const own = this.windows.filter(w => w.appId === appId).sort((a, b) => b.z - a.z)
      const visible = own.find(w => !w.minimized)
      if (visible) {
        this.$store.dispatch('windows/focus', visible.id)
      } else if (own.length) {
        this.$store.dispatch('windows/restore', own[0].id)
      } else if (!this.launching.includes(appId)) {
        // Bounce while the application "launches"
        this.launching.push(appId)
        setTimeout(() => {
          this.launching = this.launching.filter(id => id !== appId)
          this.$store.dispatch('windows/open', { appId })
        }, 900)
      }
    }
  }
}
</script>

<style lang="scss">
.dock {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 9000;
  transform: translateX(-50%);
  max-width: 100vw;
}

.dock__shelf {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 70px;
  padding: 0 8px 9px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  background: var(--aqua-pinstripe-translucent) top left;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}

.dock__item {
  position: relative;
  flex: none;
  padding: 0;
  border: 0;
  background: none;
  cursor: default;
  transition: width 0.08s ease-out, height 0.08s ease-out;

  &:hover .dock__label,
  &:focus-visible .dock__label {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;

    .dock__icon {
      filter: drop-shadow(0 0 4px rgba(61, 128, 223, 0.9));
    }
  }

  &:active .dock__icon {
    filter: brightness(0.6);
  }

  &.is-bouncing .dock__icon {
    animation: dock-bounce 0.45s ease-in-out 2;
  }
}

.dock__separator {
  flex: none;
  align-self: stretch;
  width: 1px;
  margin: 6px 4px 0;
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 1px 0 0 rgba(255, 255, 255, 0.6);
}

.dock__icon {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.dock__badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 40%;
  height: 40%;
}

.dock__indicator {
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 10px;
  height: 6px;
  transform: translateX(-50%);
}

.dock__label {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  padding: 1px 8px;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  color: #000;
  background: rgba(255, 255, 255, 0.67);
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.dock.is-compact .dock__shelf {
  height: 56px;
  gap: 4px;
}

@keyframes dock-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-24px); }
}

@media (prefers-reduced-motion: reduce) {
  .dock__item.is-bouncing .dock__icon {
    animation: none;
  }
}
</style>
