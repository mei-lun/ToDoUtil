import { useMemo } from 'react'
import { useTasksStore } from '../store/tasks-store'
import { useViewStore } from '../store/view-store'
import { TaskRow } from '../components/TaskRow'

export function TodayView() {
  const tasks = useTasksStore(s => s.tasks)
  const currentDate = useViewStore(s => s.currentDate)

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

  return (
    <div className="today-view">
      {visible.length === 0 && <div className="empty-state">还没有任务</div>}
      {visible.map(t => <TaskRow key={t.id} task={t} />)}
    </div>
  )
}
