import { useRef, useEffect } from 'react'
import { renderMarkdown } from '../utils/markdown'
import { toggleSubtaskAt } from '../utils/subtasks'

interface Props {
  source: string
  readOnly?: boolean
  onChange?: (next: string) => void
}

export function MarkdownView({ source, readOnly, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const html = renderMarkdown(source)

  useEffect(() => {
    if (!ref.current || readOnly) return
    const root = ref.current
    const handler = (e: Event) => {
      const tgt = e.target as HTMLElement
      if (tgt.tagName !== 'INPUT' || (tgt as HTMLInputElement).type !== 'checkbox') return
      const all = Array.from(root.querySelectorAll('input[type="checkbox"]'))
      const idx = all.indexOf(tgt as HTMLInputElement)
      if (idx >= 0 && onChange) onChange(toggleSubtaskAt(source, idx))
      e.preventDefault()
    }
    root.addEventListener('click', handler)
    return () => root.removeEventListener('click', handler)
  }, [source, readOnly, onChange])

  return <div ref={ref} className="md-view" dangerouslySetInnerHTML={{ __html: html }} />
}
