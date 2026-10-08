import { formatDate } from '../../utils/posts'

export const CATEGORIES = {
  city: '城市',
  nature: '自然风光',
  landmark: '名胜古迹',
  food: '美食',
  other: '其他'
}

export function placeLocation(place) {
  // Skip parts that repeat, e.g. 北京市 · 北京市 · 中国
  return [place.city, place.region, place.country].filter((part, i, all) => part && all.indexOf(part) === i).join(' · ')
}

export function visitRange(start, end) {
  if (!start) {
    return ''
  }
  if (!end || end === start) {
    return formatDate(start)
  }
  const [sy, sm] = start.split('-')
  const [ey, em, ed] = end.split('-')
  if (sy === ey && sm === em) {
    return `${formatDate(start)} – ${Number(ed)}日`
  }
  if (sy === ey) {
    return `${formatDate(start)} – ${Number(em)}月${Number(ed)}日`
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}

export function stars(rating) {
  return rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : ''
}
