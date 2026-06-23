import { useState } from 'react'
import { usePoolStore } from '../store/pool-store'
import { useTasksStore } from '../store/tasks-store'
import { useViewStore } from '../store/view-store'
import { DatePickerPopover } from '../components/DatePickerPopover'
import { pullFromPool } from '../utils/task-actions'
import type { Task } from '../types'

export function PoolView() {
  const pool = usePoolStore(s => s.pool)
  const reloadPool = usePoolStore(s => s.load)
  const reloadTasks = useTasksStore(s => s.load)
  const setMode = useViewStore(s => s.setMode)
  const [picking, setPicking] = useState<Task | null>(null)

  return (
    <div className="pool-view">
      <div className="subview-bar">
        <button className="icon-btn" onClick={() => setMode('date')}>◀ 返回</button>
        <span className="date-label">搁置池</span>
      </div>
      <div className="task-list">
        {pool.length === 0 && <div className="empty-state">搁置池是空的</div>}
        {pool.map(t => (
          <div key={t.id} className="task-row">
            <span className="task-title">{t.title}</span>
            <button className="row-action" onClick={() => setPicking(t)}>拉回到…</button>
          </div>
        ))}
      </div>
      {picking && (
        <DatePickerPopover
          onCancel={() => setPicking(null)}
          onPick={async (date) => {
            await pullFromPool(picking, date)
            setPicking(null)
            await reloadPool()
            await reloadTasks()
          }}
        />
      )}
    </div>
  )
}
