import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n, { setLocale, tc } from './i18n'
import { useSystemStore } from './store/system'
import './style/aqua.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
// Plurals in templates, with the same arguments as tc() in plain modules
app.config.globalProperties.$tc = tc

setLocale(useSystemStore().prefs.language)

app.mount('#app')
