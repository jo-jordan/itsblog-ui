import { defineStore } from 'pinia'
import { apps } from '../apps/registry'

const MENU_BAR = 22
const DOCK = 80
const MIN_WIDTH = 320
const MIN_HEIGHT = 200

let nextId = 1

function viewport() {
  return { width: window.innerWidth, height: window.innerHeight }
}

// Usable desktop area: below the menu bar and above the Dock
export function desktopArea() {
  const { width, height } = viewport()
  return { x: 0, y: MENU_BAR, width, height: height - MENU_BAR - DOCK }
}

function initialRect(app, count) {
  const area = desktopArea()
  const width = Math.min(app.size.width, area.width - 24)
  const height = Math.min(app.size.height, area.height - 16)
  const cascade = (count % 6) * 24
  return {
    x: Math.max(8, Math.round((area.width - width) / 2) + cascade - 60),
    y: Math.max(area.y + 8, Math.round(area.y + (area.height - height) / 3) + cascade),
    width,
    height
  }
}

// Every open window on the desktop
export const useWindowsStore = defineStore('windows', {
  state: () => ({
    windows: [],
    focusedId: null,
    zTop: 10
  }),
  getters: {
    focused: state => state.windows.find(w => w.id === state.focusedId) || null,
    // The application the menu bar belongs to; Finder owns the empty desktop
    activeAppId() {
      return this.focused ? this.focused.appId : 'finder'
    },
    runningAppIds: state => [...new Set(state.windows.map(w => w.appId))],
    minimized: state => state.windows.filter(w => w.minimized)
  },
  actions: {
    find(id) {
      return this.windows.find(w => w.id === id)
    },
    topVisible() {
      return this.windows
        .filter(w => !w.minimized)
        .sort((a, b) => b.z - a.z)[0]
    },
    update(id, changes) {
      const win = this.find(id)
      if (win) {
        Object.assign(win, changes)
      }
    },
    remove(id) {
      this.windows = this.windows.filter(w => w.id !== id)
      if (this.focusedId === id) {
        this.focusedId = null
      }
    },
    open({ appId, props = {}}) {
      const app = apps[appId]
      // Apps declare which props make a window unique, e.g. one Reader per post
      const key = app.instanceKey ? app.instanceKey(props) : appId
      const existing = this.windows.find(w => w.key === key)
      if (existing) {
        this.update(existing.id, { props: { ...existing.props, ...props }, minimized: false })
        this.focus(existing.id)
        return existing.id
      }
      const id = nextId++
      this.windows.push({
        id,
        key,
        appId,
        props,
        ...initialRect(app, this.windows.length),
        z: 0,
        minimized: false,
        zoomed: false,
        restoreRect: null
      })
      this.focus(id)
      return id
    },
    close(id) {
      this.remove(id)
      const next = this.topVisible()
      if (next) {
        this.focus(next.id)
      }
    },
    closeApp(appId) {
      this.windows.filter(w => w.appId === appId).forEach(w => this.close(w.id))
    },
    closeAll() {
      this.windows = []
      this.focusedId = null
    },
    focus(id) {
      const win = this.find(id)
      if (win) {
        win.z = ++this.zTop
      }
      this.focusedId = id
    },
    blur() {
      this.focusedId = null
    },
    minimize(id) {
      this.update(id, { minimized: true })
      if (this.focusedId === id) {
        this.blur()
        const next = this.topVisible()
        if (next) {
          this.focus(next.id)
        }
      }
    },
    restore(id) {
      this.update(id, { minimized: false })
      this.focus(id)
    },
    toggleZoom(id) {
      const win = this.find(id)
      if (!win) {
        return
      }
      if (win.zoomed && win.restoreRect) {
        this.update(id, { ...win.restoreRect, zoomed: false, restoreRect: null })
      } else {
        const area = desktopArea()
        this.update(id, {
          restoreRect: { x: win.x, y: win.y, width: win.width, height: win.height },
          x: area.x + 6,
          y: area.y + 4,
          width: area.width - 12,
          height: area.height - 8,
          zoomed: true
        })
      }
    },
    move({ id, x, y }) {
      const { width, height } = viewport()
      this.update(id, {
        // Keep enough of the title bar on screen to grab it again
        x: Math.min(Math.max(x, -200), width - 80),
        y: Math.min(Math.max(y, MENU_BAR), height - DOCK - 22),
        zoomed: false
      })
    },
    resize({ id, width, height }) {
      this.update(id, {
        width: Math.max(MIN_WIDTH, width),
        height: Math.max(MIN_HEIGHT, height),
        zoomed: false
      })
    }
  }
})
