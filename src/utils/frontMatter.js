// Minimal YAML front matter parser for posts: `key: value` pairs,
// quoted strings and inline `[a, b]` lists are all that posts need.
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function parseValue(raw) {
  const value = raw.trim()
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map(parseValue).filter(v => v !== '')
  }
  if (/^(['"]).*\1$/.test(value)) {
    return value.slice(1, -1)
  }
  return value
}

export function parseFrontMatter(text) {
  const match = FRONT_MATTER.exec(text)
  if (!match) {
    return { data: {}, body: text }
  }
  const data = {}
  match[1].split(/\r?\n/).forEach(line => {
    const index = line.indexOf(':')
    if (index > 0 && !line.trimStart().startsWith('#')) {
      data[line.slice(0, index).trim()] = parseValue(line.slice(index + 1))
    }
  })
  return { data, body: text.slice(match[0].length) }
}
