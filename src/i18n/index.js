import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// Languages the site is written in; the first one is the fallback
export const LOCALES = [
  { id: 'zh-CN', name: '简体中文' },
  { id: 'en', name: 'English' }
]

export const DEFAULT_LOCALE = LOCALES[0].id

// Every file in a locale directory is a namespace: locales/en/finder.js → finder.*
export function collect(context) {
  return context.keys().reduce((messages, key) => {
    messages[key.replace(/^\.\//, '').replace(/\.js$/, '')] = context(key).default
    return messages
  }, {})
}

// First browser language we have a translation for; anything that is not Chinese reads English
export function browserLocale() {
  const wanted = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || []
  for (const tag of wanted) {
    const language = String(tag || '').toLowerCase().split('-')[0]
    if (language === 'zh') {
      return 'zh-CN'
    }
    if (language) {
      return 'en'
    }
  }
  return DEFAULT_LOCALE
}

// The language preference is a locale id, or 'auto' to follow the browser
export function resolveLocale(preference) {
  return LOCALES.some(locale => locale.id === preference) ? preference : browserLocale()
}

const i18n = new VueI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  silentFallbackWarn: true,
  messages: {
    'zh-CN': collect(require.context('./locales/zh-CN', false, /\.js$/)),
    en: collect(require.context('./locales/en', false, /\.js$/))
  }
})

export function setLocale(preference) {
  i18n.locale = resolveLocale(preference)
  document.documentElement.lang = i18n.locale
}

// Text kept beside its data as { 'zh-CN': …, en: … } (site owner, wallpapers)
export function localize(text) {
  return text && typeof text === 'object' ? text[i18n.locale] || text[DEFAULT_LOCALE] : text
}

// For plain modules; reactive when called from a computed property or a render
export const t = (key, values) => i18n.t(key, values)
export const tc = (key, count, values) => i18n.tc(key, count, values)
export const currentLocale = () => i18n.locale

export default i18n
