import { t } from '../../i18n'
import { formatLongDate, formatMonthDay } from '../../i18n/format'

export const CATEGORIES = ['city', 'nature', 'landmark', 'food', 'other']

// Looked up on every call, so labels follow the language when used in a render
export function categoryLabel(category) {
  return t(`footprints.categories.${CATEGORIES.includes(category) ? category : 'other'}`)
}

export function placeLocation(place) {
  // Skip parts that repeat, e.g. Beijing · Beijing · China
  return [place.city, place.region, place.country].filter((part, i, all) => part && all.indexOf(part) === i).join(' · ')
}

// A visit's dates, without repeating the parts both ends share
export function visitRange(start, end) {
  if (!start) {
    return ''
  }
  if (!end || end === start) {
    return formatLongDate(start)
  }
  const [sy, sm] = start.split('-')
  const [ey, em, ed] = end.split('-')
  const values = {
    start: formatLongDate(start),
    end: formatLongDate(end),
    startMonthDay: formatMonthDay(start),
    endMonthDay: formatMonthDay(end),
    endDay: Number(ed),
    year: Number(ey)
  }
  if (sy === ey && sm === em) {
    return t('footprints.range.sameMonth', values)
  }
  if (sy === ey) {
    return t('footprints.range.sameYear', values)
  }
  return t('footprints.range.other', values)
}

export function stars(rating) {
  return rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : ''
}
