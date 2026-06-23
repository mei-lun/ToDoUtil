import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

interface Props {
  initial: string
  taskId: string
  onSave: (next: string) => void
  onCancel: () => void
}

const IMG_EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
}

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const bin = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bin.length; i++) s += String.fromCharCode(bin[i])
  return btoa(s)
}

export function MarkdownEditor({ initial, taskId, onSave, onCancel }: Props) {
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
    if (value !== initial) onSave(value)
    else onCancel()
  }

  async function insertImage(file: File) {
    const ext = IMG_EXT_BY_MIME[file.type] ?? 'png'
    const b64 = await fileToBase64(file)
    try {
      const rel = await api.attach.save(taskId, b64, ext)
      const ta = ref.current
      if (!ta) return
      const cursor = ta.selectionStart
      const snippet = `\n![](${rel})\n`
      setValue(prev => prev.slice(0, cursor) + snippet + prev.slice(cursor))
      requestAnimationFrame(() => {
        ta.focus()
        ta.selectionStart = ta.selectionEnd = cursor + snippet.length
      })
    } catch (err) {
      console.error('attach save failed', err)
    }
  }

  async function onPaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items)
    for (const it of items) {
      if (it.kind === 'file' && it.type.startsWith('image/')) {
        e.preventDefault()
        const f = it.getAsFile()
        if (f) await insertImage(f)
        return
      }
    }
  }

  async function onDrop(e: React.DragEvent) {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) {
      e.preventDefault()
      for (const f of files) {
        await insertImage(f)
        await new Promise(r => requestAnimationFrame(() => r(null)))
      }
    }
  }

  function onDragOver(e: React.DragEvent) {
    if (Array.from(e.dataTransfer.items).some(it => it.kind === 'file')) {
      e.preventDefault()
    }
  }

  return (
    <textarea
      ref={ref}
      className="md-editor"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={onDragOver}
      placeholder="写点什么…支持 markdown（粘贴/拖拽图片）"
    />
  )
}
