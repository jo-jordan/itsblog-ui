import { parseFrontMatter } from './frontMatter'

// Every Markdown file under content/posts is bundled at build time.
const context = require.context('../../content/posts', true, /\.md$/)

function toPost(key) {
  const { data, body } = parseFrontMatter(context(key))
  const slug = key.replace(/^\.\//, '').replace(/\.md$/, '').split('/').pop()
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    category: data.category || '未分类',
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary || '',
    body
  }
}

export const posts = context.keys()
  .map(toPost)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))

// Categories ordered by their most recent post
export const categories = posts.reduce((list, post) => {
  if (!list.includes(post.category)) {
    list.push(post.category)
  }
  return list
}, [])

export function findPost(slug) {
  return posts.find(post => post.slug === slug)
}

export function postsIn(category) {
  return posts.filter(post => post.category === category)
}

export function neighbours(slug) {
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
  const scored = posts.map(post => {
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

export function formatDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  return match ? `${match[1]}年${Number(match[2])}月${Number(match[3])}日` : date
}
