import Vue from 'vue'
import Vuex from 'vuex'
import windows from './modules/windows'
import system from './modules/system'
import session from './modules/session'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    windows,
    system,
    session
  }
})
