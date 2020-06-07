import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './style/style.css'
import './route_watcher'

Vue.config.productionTip = false

let Event = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

export default Event
