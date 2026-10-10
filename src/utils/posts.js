import { parseFrontMatter } from './frontMatter'
import { DEFAULT_LOCALE, LOCALES, currentLocale, t } from '../i18n'

// Every Markdown file under content/posts is bundled at build time.
// <slug>.md is the post in the default language, <slug>.<locale>.md a translation.
const context = require.context('../../content/posts', true, /\.md$/)

const sources = {}
context.keys().forEach(key => {
  const name = key.replace(/^\.\//, '').replace(/\.md$/, '').split('/').pop()
  const locale = LOCALES.map(item => item.id).find(id => name.endsWith(`.${id}`)) || DEFAULT_LOCALE
  const slug = name.endsWith(`.${locale}`) ? name.slice(0, -locale.length - 1) : name
  sources[slug] = { ...sources[slug], [locale]: parseFrontMatter(context(key)) }
})

function toPost(slug, locale) {
  const versions = sources[slug]
  // Posts without a translation show in the language they were written in
  const { data, body } = versions[locale] || versions[DEFAULT_LOCALE] || versions[Object.keys(versions)[0]]
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    category: data.category || t('posts.uncategorized'),
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary || '',
    body
  }
}

const cache = {}

// Posts in the current language, newest first
export function listPosts() {
  const locale = currentLocale()
  if (!cache[locale]) {
    cache[locale] = Object.keys(sources)
      .map(slug => toPost(slug, locale))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))
  }
  return cache[locale]
}

// Categories ordered by their most recent post
export function listCategories() {
  return listPosts().reduce((list, post) => {
    if (!list.includes(post.category)) {
      list.push(post.category)
    }
    return list
  }, [])
}

export function findPost(slug) {
  return listPosts().find(post => post.slug === slug)
}

export function postsIn(category) {
  return listPosts().filter(post => post.category === category)
}

export function neighbours(slug) {
  const posts = listPosts()
  const index = posts.findIndex(post => post.slug === slug)
  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null
  }
}

function countOccurrences(haystack, needle) {
  let count = 0
  let index = haystack.indexOf(needle)
  while (index !== -1) {
    count++
    index = haystack.indexOf(needle, index + needle.length)
  }
  return count
}

// Sherlock-style relevance: title and tag hits weigh more than body hits.
export function searchPosts(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) {
    return []
  }
  const scored = listPosts().map(post => {
    const title = post.title.toLowerCase()
    const meta = [post.category, ...post.tags, post.summary].join(' ').toLowerCase()
    const body = post.body.toLowerCase()
    let score = 0
    for (const term of terms) {
      const hits = countOccurrences(title, term) * 8 + countOccurrences(meta, term) * 4 + countOccurrences(body, term)
      if (!hits) {
        return { post, score: 0 }
      }
      score += hits
    }
    return { post, score }
  }).filter(result => result.score > 0)
  const best = Math.max(...scored.map(result => result.score), 1)
  return scored
    .map(result => ({ ...result, relevance: result.score / best }))
    .sort((a, b) => b.score - a.score)
}

export function readingMinutes(text) {
  const cjk = (text.match(/[㐀-鿿]/g) || []).length
  const words = text.replace(/[㐀-鿿]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(cjk / 400 + words / 200))
}
