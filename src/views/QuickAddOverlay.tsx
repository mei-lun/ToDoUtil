import { useEffect, useRef } from 'react'
import { useViewStore } from '../store/view-store'
import { useTasksStore } from '../store/tasks-store'
import { parseRawTitle } from '../utils/date-parser'
import { todayStr } from '../utils/date-utils'
import { v4 as uuidv4 } from 'uuid'

export function QuickAddOverlay() {
  const open = useViewStore(s => s.quickAddOpen)
  const setOpen = useViewStore(s => s.setQuickAddOpen)
  const upsert = useTasksStore(s => s.upsert)
  const tasks = useTasksStore(s => s.tasks)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => ref.current?.focus(), 50)
      return () => window.clearTimeout(t)
    }
    if (ref.current) ref.current.value = ''
  }, [open])

  if (!open) return null

  function submit() {
    const v = ref.current?.value.trim() ?? ''
    if (!v) { setOpen(false); return }
    const parsed = parseRawTitle(v, todayStr())
    const orderMax = tasks
      .filter(t => t.plannedDate === parsed.plannedDate)
      .reduce((m, t) => Math.max(m, t.order), 0)
    upsert({
      id: uuidv4(),
      title: parsed.title || v,
      rawTitle: v,
      detail: '',
      plannedDate: parsed.plannedDate,
      plannedTime: parsed.plannedTime,
      createdAt: new Date().toISOString(),
      status: 'active',
      order: orderMax + 1,
      attachments: [],
      originalPlannedDate: parsed.plannedDate,
      pooledRanges: [],
    })
    setOpen(false)
  }

  return (
    <div className="quick-add-mask" onClick={() => setOpen(false)}>
      <div className="quick-add-box" onClick={(e) => e.stopPropagation()}>
        <input
          ref={ref}
          className="quick-add-input"
          placeholder="＋ 输入任务，回车添加"
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); submit() }
            if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
          }}
        />
        <div className="quick-add-hint">Enter 添加 · Esc 取消</div>
      </div>
    </div>
  )
}
