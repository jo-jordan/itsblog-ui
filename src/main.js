import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n, { setLocale } from './i18n'
import './style/aqua.scss'

Vue.config.productionTip = false

setLocale(store.state.system.prefs.language)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
