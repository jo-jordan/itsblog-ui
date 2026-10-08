import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/xcode.css'

Object.entries({ bash, css, go, java, javascript, json, kotlin, python, sql, swift, typescript, xml, yaml })
  .forEach(([name, language]) => hljs.registerLanguage(name, language))

const renderer = new marked.Renderer()
const renderLink = renderer.link.bind(renderer)
renderer.link = (href, title, text) => {
  const html = renderLink(href, title, text)
  return /^https?:\/\//.test(href || '') ? html.replace(/^<a /, '<a target="_blank" rel="noopener" ') : html
}

marked.setOptions({
  renderer,
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    return lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : code
  }
})

// Markdown may come from anywhere, so the generated HTML must be
// sanitized before it is handed to v-html.
export function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text), { ADD_ATTR: ['target'] })
}
