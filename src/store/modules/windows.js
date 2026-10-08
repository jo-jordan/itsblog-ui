import { apps } from '../../apps/registry'

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

const state = {
  windows: [],
  focusedId: null,
  zTop: 10
}

const getters = {
  focused: state => state.windows.find(w => w.id === state.focusedId) || null,
  // The application the menu bar belongs to; Finder owns the empty desktop
  activeAppId: (state, getters) => (getters.focused ? getters.focused.appId : 'finder'),
  runningAppIds: state => [...new Set(state.windows.map(w => w.appId))],
  minimized: state => state.windows.filter(w => w.minimized)
}

const mutations = {
  ADD(state, win) {
    state.windows.push(win)
  },
  REMOVE(state, id) {
    state.windows = state.windows.filter(w => w.id !== id)
    if (state.focusedId === id) {
      state.focusedId = null
    }
  },
  BLUR(state) {
    state.focusedId = null
  },
  FOCUS(state, id) {
    const win = state.windows.find(w => w.id === id)
    if (win) {
      win.z = ++state.zTop
    }
    state.focusedId = id
  },
  UPDATE(state, { id, ...changes }) {
    const win = state.windows.find(w => w.id === id)
    if (win) {
      Object.assign(win, changes)
    }
  }
}

function topVisible(state) {
  return state.windows
    .filter(w => !w.minimized)
    .sort((a, b) => b.z - a.z)[0]
}

const actions = {
  open({ state, commit }, { appId, props = {} }) {
    const app = apps[appId]
    // Apps declare which props make a window unique, e.g. one Reader per post
    const key = app.instanceKey ? app.instanceKey(props) : appId
    const existing = state.windows.find(w => w.key === key)
    if (existing) {
      commit('UPDATE', { id: existing.id, props: { ...existing.props, ...props }, minimized: false })
      commit('FOCUS', existing.id)
      return existing.id
    }
    const id = nextId++
    commit('ADD', {
      id,
      key,
      appId,
      props,
      ...initialRect(app, state.windows.length),
      z: 0,
      minimized: false,
      zoomed: false,
      restoreRect: null
    })
    commit('FOCUS', id)
    return id
  },
  close({ state, commit }, id) {
    commit('REMOVE', id)
    const next = topVisible(state)
    if (next) {
      commit('FOCUS', next.id)
    }
  },
  closeApp({ state, dispatch }, appId) {
    state.windows.filter(w => w.appId === appId).forEach(w => dispatch('close', w.id))
  },
  closeAll({ state, commit }) {
    state.windows.slice().forEach(w => commit('REMOVE', w.id))
  },
  focus({ commit }, id) {
    commit('FOCUS', id)
  },
  blur({ commit }) {
    commit('BLUR')
  },
  minimize({ state, commit }, id) {
    commit('UPDATE', { id, minimized: true })
    if (state.focusedId === id) {
      commit('BLUR')
      const next = topVisible(state)
      if (next) {
        commit('FOCUS', next.id)
      }
    }
  },
  restore({ commit }, id) {
    commit('UPDATE', { id, minimized: false })
    commit('FOCUS', id)
  },
  toggleZoom({ state, commit }, id) {
    const win = state.windows.find(w => w.id === id)
    if (!win) {
      return
    }
    if (win.zoomed && win.restoreRect) {
      commit('UPDATE', { id, ...win.restoreRect, zoomed: false, restoreRect: null })
    } else {
      const area = desktopArea()
      commit('UPDATE', {
        id,
        restoreRect: { x: win.x, y: win.y, width: win.width, height: win.height },
        x: area.x + 6,
        y: area.y + 4,
        width: area.width - 12,
        height: area.height - 8,
        zoomed: true
      })
    }
  },
  move({ commit }, { id, x, y }) {
    const { width, height } = viewport()
    commit('UPDATE', {
      id,
      // Keep enough of the title bar on screen to grab it again
      x: Math.min(Math.max(x, -200), width - 80),
      y: Math.min(Math.max(y, MENU_BAR), height - DOCK - 22),
      zoomed: false
    })
  },
  resize({ commit }, { id, width, height }) {
    commit('UPDATE', {
      id,
      width: Math.max(MIN_WIDTH, width),
      height: Math.max(MIN_HEIGHT, height),
      zoomed: false
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
