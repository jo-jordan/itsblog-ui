import { createI18n } from 'vue-i18n'

// Languages the site is written in; the first one is the fallback
export const LOCALES = [
  { id: 'zh-CN', name: '简体中文' },
  { id: 'en', name: 'English' }
]

export const DEFAULT_LOCALE = LOCALES[0].id

// Every file in a locale directory is a namespace: locales/en/finder.js → finder.*
// `modules` is an eager import.meta.glob of all the locale directories.
export function collect(modules) {
  const messages = {}
  Object.keys(modules).forEach(path => {
    const [, locale, namespace] = /\/([^/]+)\/([^/]+)\.js$/.exec(path)
    messages[locale] = { ...messages[locale], [namespace]: modules[path].default }
  })
  return messages
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

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  missingWarn: false,
  fallbackWarn: false,
  messages: collect(import.meta.glob('./locales/*/*.js', { eager: true }))
})

const composer = i18n.global

export function setLocale(preference) {
  composer.locale.value = resolveLocale(preference)
  document.documentElement.lang = composer.locale.value
}

// Text kept beside its data as { 'zh-CN': …, en: … } (site owner, wallpapers)
export function localize(text) {
  return text && typeof text === 'object' ? text[composer.locale.value] || text[DEFAULT_LOCALE] : text
}

// Messages that load later, with a lazy chunk: addMessages('tools', collect(…))
export function addMessages(namespace, messages) {
  Object.keys(messages).forEach(locale => {
    composer.setLocaleMessage(locale, { ...composer.getLocaleMessage(locale), [namespace]: messages[locale] })
  })
}

// For plain modules; reactive when called from a computed property or a render.
// tc picks the plural form for `count` ({n} in the message unless `values` gives one),
// tm returns a message that is a list or a group rather than a string.
export const t = (key, values) => composer.t(key, values || {})
export const tc = (key, count, values) => composer.t(key, { n: count, ...values }, count)
export const tm = key => composer.tm(key)
export const currentLocale = () => composer.locale.value

export default i18n
