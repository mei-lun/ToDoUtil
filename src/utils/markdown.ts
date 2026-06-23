import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ breaks: true, gfm: true })

export function renderMarkdown(src: string): string {
  const html = marked.parse(src, { async: false }) as string
  const clean = DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
    ALLOWED_URI_REGEXP: /^(https?|file|data|attachments):/i,
  })
  // marked renders GFM task-list checkboxes as `<input disabled type="checkbox">`.
  // DOMPurify drops the `type` attribute for <input> (its default whitelist
  // doesn't include it), and the `disabled` attribute would also suppress click
  // events. Both need restoring/removing so the MarkdownView click handler can
  // toggle them.
  return clean
    .replace(/(<input\b[^>]*?)\sdisabled(="[^"]*")?/gi, '$1')
    .replace(/<input\b(?![^>]*\btype=)([^>]*?)>/gi, '<input type="checkbox"$1>')
}
