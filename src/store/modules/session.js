import { session as api } from '../../api/client'

// Whether the site owner is signed in (enables editing footprints)
const state = {
  checked: false,
  configured: true,
  loggedIn: false
}

const mutations = {
  SET(state, { configured, loggedIn }) {
    state.checked = true
    state.configured = configured
    state.loggedIn = loggedIn
  }
}

const actions = {
  async check({ commit }) {
    try {
      commit('SET', await api.get())
    } catch (e) {
      // No API (e.g. plain static hosting): the site stays read-only
      commit('SET', { configured: false, loggedIn: false })
    }
  },
  async login({ commit, state }, password) {
    await api.login(password)
    commit('SET', { configured: state.configured, loggedIn: true })
  },
  async logout({ commit, state }) {
    await api.logout()
    commit('SET', { configured: state.configured, loggedIn: false })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
