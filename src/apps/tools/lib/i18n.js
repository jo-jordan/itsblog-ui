// The toolbox's own messages (locales/<locale>/<tool>.js → tools.<tool>.*)
// load with its lazy chunk rather than with the desktop.
import i18n, { collect } from '../../../i18n'

// (set rather than merged: mergeLocaleMessage turns arrays into objects)
const messages = {
  'zh-CN': collect(require.context('../locales/zh-CN', false, /\.js$/)),
  en: collect(require.context('../locales/en', false, /\.js$/))
}
Object.keys(messages).forEach(locale => {
  i18n.setLocaleMessage(locale, { ...i18n.getLocaleMessage(locale), tools: messages[locale] })
})

export { t, tc, currentLocale } from '../../../i18n'
export { formatLongDate, formatMonthDay, formatYearMonth, formatNumber, relativeTime, weekdayName } from '../../../i18n/format'
