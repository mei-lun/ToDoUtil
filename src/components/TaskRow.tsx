import { useEffect, useRef, useState } from 'react'
import { useTasksStore } from '../store/tasks-store'
import { usePoolStore } from '../store/pool-store'
import { useViewStore } from '../store/view-store'
import type { Task } from '../types'
import { api } from '../api'
import { countSubtasks } from '../utils/subtasks'
import { postponeOneDay, moveToPool, abandonTask } from '../utils/task-actions'
import { TaskDetail } from './TaskDetail'
import { DelayBadge } from './DelayBadge'

const COMMIT_DELAY_MS = 2000

export function TaskRow({ task }: { task: Task }) {
  const upsert = useTasksStore(s => s.upsert)
  const reload = useTasksStore(s => s.load)
  const reloadPool = usePoolStore(s => s.load)
  const toggleExpand = useViewStore(s => s.toggleExpand)
  const setEditing = useViewStore(s => s.setEditing)
  const expandedId = useViewStore(s => s.expandedTaskId)
  const expanded = expandedId === task.id
  const [pendingDone, setPendingDone] = useState(task.status === 'done')
  const [draggable, setDraggable] = useState(false)
  const timerRef = useRef<number | null>(null)
  const longPressTimer = useRef<number | null>(null)

  useEffect(() => { setPendingDone(task.status === 'done') }, [task.status])

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (longPressTimer.current != null) {
        window.clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }, [])

  function onMouseDown() {
    if (longPressTimer.current != null) window.clearTimeout(longPressTimer.current)
    longPressTimer.current = window.setTimeout(() => {
      setDraggable(true)
      longPressTimer.current = null
    }, 300)
  }
  function clearLongPress() {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }
  function onMouseUp() {
    clearLongPress()
    window.setTimeout(() => setDraggable(false), 0)
  }

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/task-id', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function cancelTimer() {
    if (timerRef.current != null) { window.clearTimeout(timerRef.current); timerRef.current = null }
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

  const sub = countSubtasks(task.detail)

  return (
    <>
      <div
        className={`task-row ${pendingDone ? 'is-done' : ''} ${expanded ? 'is-expanded' : ''} ${draggable ? 'is-draggable' : ''}`}
        draggable={draggable}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={clearLongPress}
        onDragStart={onDragStart}
        onClick={() => toggleExpand(task.id)}
      >
        <button className="task-check" onClick={toggleDone} aria-label="完成">
          {pendingDone ? '●' : '○'}
        </button>
        <DelayBadge originalPlannedDate={task.originalPlannedDate} />
        <span className="task-title">{task.title}</span>
        {sub.total > 0 && <span className="subtask-count">{sub.done}/{sub.total}</span>}
        {task.plannedTime && <span className="task-time">{task.plannedTime}</span>}
        <span className="row-actions">
          <button
            className="row-action"
            title="推迟一天"
            onClick={async (e) => {
              e.stopPropagation()
              await postponeOneDay(task)
              await reload()
            }}
          >
            →
          </button>
          <button
            className="row-action"
            title="搁置"
            onClick={async (e) => {
              e.stopPropagation()
              await moveToPool(task)
              await reload()
              await reloadPool()
            }}
          >
            📥
          </button>
          <button
            className="row-action"
            title="编辑详情"
            onClick={(e) => {
              e.stopPropagation()
              if (!expanded) toggleExpand(task.id)
              setEditing(task.id)
            }}
          >
            ✎
          </button>
          <button
            className="row-action"
            title="放弃"
            onClick={async (e) => {
              e.stopPropagation()
              if (!window.confirm(`放弃任务"${task.title}"？`)) return
              await abandonTask(task)
              await reload()
            }}
          >
            ✕
          </button>
        </span>
      </div>
      {expanded && <TaskDetail task={task} />}
    </>
  )
}
