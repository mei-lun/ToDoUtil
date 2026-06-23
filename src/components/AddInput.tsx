import { useEffect, useRef } from 'react'
import { useViewStore } from '../store/view-store'
import { useTasksStore } from '../store/tasks-store'
import { v4 as uuidv4 } from 'uuid'
import { parseRawTitle } from '../utils/date-parser'
import { todayStr } from '../utils/date-utils'

export function AddInput() {
  const open = useViewStore(s => s.addInputOpen)
  const setOpen = useViewStore(s => s.setAddInputOpen)
  const currentDate = useViewStore(s => s.currentDate)
  const upsert = useTasksStore(s => s.upsert)
  const tasks = useTasksStore(s => s.tasks)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function submit() {
    const v = inputRef.current?.value.trim() ?? ''
    if (!v) return
    const parsed = parseRawTitle(v, todayStr())
    const orderMax = tasks.filter(t => t.plannedDate === parsed.plannedDate)
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
    if (inputRef.current) inputRef.current.value = ''
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); submit() }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
  }

  function onBlur() {
    if (!inputRef.current?.value.trim()) setOpen(false)
  }

  return (
    <div className="add-input">
      {!open ? (
        <button className="add-btn" onClick={() => setOpen(true)} aria-label="添加任务">＋</button>
      ) : (
        <input
          ref={inputRef}
          className="add-input-field"
          placeholder="输入任务，回车添加…"
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      )}
    </div>
  )
}
