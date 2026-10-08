import { wallpapers } from '../../config/wallpapers'

const PREFS_KEY = 'itsblog.prefs'
const BOOTED_KEY = 'itsblog.booted'

const defaultPrefs = {
  wallpaper: wallpapers[0].id,
  appearance: 'blue',
  magnification: true,
  minimizeEffect: 'genie'
}

function loadPrefs() {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch (e) {
    return { ...defaultPrefs }
  }
}

function hasBooted() {
  try {
    return sessionStorage.getItem(BOOTED_KEY) === '1'
  } catch (e) {
    return false
  }
}

const state = {
  prefs: loadPrefs(),
  // booting → on → sleep | off
  power: hasBooted() ? 'on' : 'booting'
}

const mutations = {
  SET_PREF(state, { key, value }) {
    state.prefs = { ...state.prefs, [key]: value }
  },
  SET_POWER(state, power) {
    state.power = power
  }
}

const actions = {
  setPref({ commit, state }, payload) {
    commit('SET_PREF', payload)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs))
    } catch (e) {
      // Preferences simply won't survive a reload
    }
  },
  booted({ commit }) {
    commit('SET_POWER', 'on')
    try {
      sessionStorage.setItem(BOOTED_KEY, '1')
    } catch (e) {
      // Boot screen will show again next visit
    }
  },
  sleep({ commit }) {
    commit('SET_POWER', 'sleep')
  },
  wake({ commit }) {
    commit('SET_POWER', 'on')
  },
  restart({ commit, dispatch }) {
    dispatch('windows/closeAll', null, { root: true })
    commit('SET_POWER', 'booting')
  },
  shutDown({ commit, dispatch }) {
    dispatch('windows/closeAll', null, { root: true })
    commit('SET_POWER', 'off')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
