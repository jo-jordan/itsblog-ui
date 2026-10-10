import { HTTPException } from 'hono/http-exception'

// Error messages in the languages the site is written in. The Worker cannot
// import from src/, so this is its own small table; the first locale is the
// default. Validation messages are composed from a rule and a field label.
export const DEFAULT_LOCALE = 'zh-CN'

const MESSAGES = {
  'zh-CN': {
    serverError: '服务器出错了',
    notFound: '找不到',
    placeNotFound: '找不到这个地方',
    visitNotFound: '找不到这次到访',
    photoNotFound: '找不到这张照片',
    badRequest: '请求格式不正确',
    geocoderUnavailable: '地名搜索暂时不可用',
    badCoordinates: '坐标不正确',
    imageType: '只能上传 JPEG、PNG、WebP、GIF 或 AVIF 图片',
    imageTooLarge: '图片太大了',
    notConfigured: '尚未设置管理员密码',
    tooManyAttempts: '尝试次数过多，请 15 分钟后再试',
    wrongPassword: '密码不正确',
    loginRequired: '请先登录',
    unknownCategory: '未知的类别',
    endBeforeStart: '结束日期不能早于开始日期',
    required: '{label}不能为空',
    tooLong: '{label}太长了（最多 {max} 字）',
    range: '{label}应在 {min} 到 {max} 之间',
    dateFormat: '{label}格式应为 YYYY-MM-DD',
    fields: {
      name: '名称',
      lat: '纬度',
      lng: '经度',
      country: '国家/地区',
      region: '省/州',
      city: '城市',
      rating: '评分',
      story: '游记',
      startDate: '开始日期',
      endDate: '结束日期',
      note: '备注',
      caption: '说明',
      takenAt: '拍摄日期',
      sort: '排序'
    }
  },
  en: {
    serverError: 'Something went wrong on the server',
    notFound: 'Not found',
    placeNotFound: 'This place can’t be found',
    visitNotFound: 'This visit can’t be found',
    photoNotFound: 'This photo can’t be found',
    badRequest: 'The request is malformed',
    geocoderUnavailable: 'Place search is temporarily unavailable',
    badCoordinates: 'The coordinates are invalid',
    imageType: 'Only JPEG, PNG, WebP, GIF, or AVIF images can be uploaded',
    imageTooLarge: 'The image is too large',
    notConfigured: 'No admin password has been set',
    tooManyAttempts: 'Too many attempts. Try again in 15 minutes.',
    wrongPassword: 'Incorrect password',
    loginRequired: 'Log in first',
    unknownCategory: 'Unknown category',
    endBeforeStart: 'End date can’t be before start date',
    required: '{label} is required',
    tooLong: '{label} is too long (up to {max} characters)',
    range: '{label} must be between {min} and {max}',
    dateFormat: '{label} must be in YYYY-MM-DD format',
    fields: {
      name: 'Name',
      lat: 'Latitude',
      lng: 'Longitude',
      country: 'Country/region',
      region: 'State/province',
      city: 'City',
      rating: 'Rating',
      story: 'Story',
      startDate: 'Start date',
      endDate: 'End date',
      note: 'Note',
      caption: 'Caption',
      takenAt: 'Date taken',
      sort: 'Sort order'
    }
  }
}

// The best language we have for an Accept-Language header: tags are tried in
// order of preference, languages we do not write in are skipped, and no match
// (or no header) reads Chinese.
export function pickLocale(header) {
  const tags = String(header || '').split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.map(param => /^\s*q=(.*)$/i.exec(param)).find(Boolean)
      const quality = q ? Number(q[1]) : 1
      return { language: tag.trim().toLowerCase().split('-')[0], quality: Number.isFinite(quality) ? quality : 0, index }
    })
    .filter(tag => tag.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
  for (const { language } of tags) {
    if (language === 'zh') return 'zh-CN'
    if (language === 'en') return 'en'
  }
  return DEFAULT_LOCALE
}

export function requestLocale(c) {
  return pickLocale(c.req.header('Accept-Language'))
}

// params.field names a field label, which fills {label}
export function message(locale, key, params = {}) {
  const table = MESSAGES[locale] || MESSAGES[DEFAULT_LOCALE]
  const values = { ...params, label: table.fields[params.field] }
  return table[key].replace(/\{(\w+)\}/g, (match, name) => (values[name] == null ? match : String(values[name])))
}

// Validators and helpers throw without knowing who is asking, so the error
// carries the message's key and the error handler words it for the visitor.
export function apiError(status, key, params) {
  const error = new HTTPException(status, { message: message(DEFAULT_LOCALE, key, params) })
  error.key = key
  error.params = params
  return error
}

export function errorMessage(c, error) {
  return error.key ? message(requestLocale(c), error.key, error.params) : error.message
}
