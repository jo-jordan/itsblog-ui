// The toolbox's own messages (locales/<locale>/<tool>.js → tools.<tool>.*)
// load with its lazy chunk rather than with the desktop.
import { addMessages, collect } from '../../../i18n'

addMessages('tools', collect(import.meta.glob('../locales/*/*.js', { eager: true })))

export { t, tc, tm, currentLocale } from '../../../i18n'
export { formatLongDate, formatMonthDay, formatYearMonth, formatNumber, relativeTime, weekdayName } from '../../../i18n/format'
