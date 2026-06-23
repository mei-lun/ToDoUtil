import { useEffect, useRef, useState } from 'react'
import { useTasksStore } from '../store/tasks-store'
import { useViewStore } from '../store/view-store'
import type { Task } from '../types'
import { api } from '../api'

const COMMIT_DELAY_MS = 2000

export function TaskRow({ task }: { task: Task }) {
  const upsert = useTasksStore(s => s.upsert)
  const reload = useTasksStore(s => s.load)
  const toggleExpand = useViewStore(s => s.toggleExpand)
  const expandedId = useViewStore(s => s.expandedTaskId)
  const expanded = expandedId === task.id
  const [pendingDone, setPendingDone] = useState(task.status === 'done')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setPendingDone(task.status === 'done')
  }, [task.status])

  function cancelTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  async function toggleDone(e: React.MouseEvent) {
    e.stopPropagation()
    if (pendingDone) {
      cancelTimer()
      setPendingDone(false)
      await upsert({ ...task, status: 'active', doneAt: undefined })
      return
    }
    setPendingDone(true)
    cancelTimer()
    timerRef.current = window.setTimeout(async () => {
      const finalTask: Task = { ...task, status: 'done', doneAt: new Date().toISOString(), order: -1 }
      await api.archive.append(finalTask)
      await api.tasks.delete(task.id)
      await reload()
    }, COMMIT_DELAY_MS)
  }

  return (
    <div className={`task-row ${pendingDone ? 'is-done' : ''}`} onClick={() => toggleExpand(task.id)}>
      <button className="task-check" onClick={toggleDone} aria-label="完成">
        {pendingDone ? '●' : '○'}
      </button>
      <span className="task-title">{task.title}</span>
      {task.plannedTime && <span className="task-time">{task.plannedTime}</span>}
    </div>
  )
}
