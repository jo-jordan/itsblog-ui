import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Markdown is fetched from a remote URL, so the generated HTML must be
// sanitized before it is handed to v-html.
export function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text), { ADD_ATTR: ['target'] })
}
