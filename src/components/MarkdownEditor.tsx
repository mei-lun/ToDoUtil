import { useEffect, useRef, useState } from 'react'

interface Props {
  initial: string
  onSave: (next: string) => void
  onCancel: () => void
}

export function MarkdownEditor({ initial, onSave, onCancel }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(initial)

  useEffect(() => { ref.current?.focus() }, [])

  function maybeCancel() {
    if (value !== initial) {
      const ok = window.confirm('放弃未保存的修改？')
      if (!ok) return
    }
    onCancel()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onSave(value)
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      maybeCancel()
    }
  }

  function onBlur() {
    onSave(value)
  }

  return (
    <textarea
      ref={ref}
      className="md-editor"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder="写点什么…支持 markdown"
    />
  )
}
