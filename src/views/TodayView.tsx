import { useMemo, useState } from 'react'
import { useTasksStore } from '../store/tasks-store'
import { useViewStore } from '../store/view-store'
import { TaskRow } from '../components/TaskRow'
import { api } from '../api'

export function TodayView() {
  const tasks = useTasksStore(s => s.tasks)
  const reload = useTasksStore(s => s.load)
  const currentDate = useViewStore(s => s.currentDate)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const visible = useMemo(() => {
    return tasks
      .filter(t => t.plannedDate === currentDate)
      .sort((a, b) => {
        // 完成的沉底（order=-1）
        if (a.order === -1 && b.order !== -1) return 1
        if (b.order === -1 && a.order !== -1) return -1
        return a.order - b.order
      })
  }, [tasks, currentDate])

  async function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    setDragOverId(null)
    const draggedId = e.dataTransfer.getData('text/task-id')
    if (!draggedId || draggedId === targetId) return
    const arr = visible.slice()
    const fromIdx = arr.findIndex(t => t.id === draggedId)
    const toIdx = arr.findIndex(t => t.id === targetId)
    if (fromIdx < 0 || toIdx < 0) return
    const [m] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, m)
    const reordered = arr.map((t, i) => ({ ...t, order: i + 1 }))
    const others = tasks.filter(t => t.plannedDate !== currentDate)
    await api.tasks.bulk([...others, ...reordered])
    await reload()
  }

  return (
    <div className="today-view">
      {visible.length === 0 && <div className="empty-state">还没有任务</div>}
      {visible.map(t => (
        <div
          key={t.id}
          onDragOver={(e) => { e.preventDefault(); setDragOverId(t.id) }}
          onDragLeave={() => setDragOverId((cur) => (cur === t.id ? null : cur))}
          onDrop={(e) => onDrop(e, t.id)}
          className={dragOverId === t.id ? 'drop-target' : ''}
        >
          <TaskRow task={t} />
        </div>
      ))}
    </div>
  )
}
