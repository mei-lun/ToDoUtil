import type { Task } from '../types'
import { api } from '../api'
import { addDays, todayStr } from './date-utils'

export async function postponeOneDay(task: Task): Promise<void> {
  await api.tasks.upsert({ ...task, plannedDate: addDays(task.plannedDate, 1) })
}

export async function moveToPool(task: Task): Promise<void> {
  const today = todayStr()
  const ranges = [...task.pooledRanges, { from: today, to: null }]
  const next: Task = { ...task, status: 'pooled', pooledRanges: ranges }
  await api.pool.add(next)
  await api.tasks.delete(task.id)
}

export async function abandonTask(task: Task): Promise<void> {
  // NOTE: attachments/<task.id>/ is intentionally NOT removed here.
  // Archive markdown references attachments:// URLs that must keep
  // resolving when the user reopens the archived entry. A periodic
  // orphan-scan (planned for a future phase) is the right cleanup
  // path for entries that are truly unreferenced.
  const next: Task = { ...task, status: 'abandoned', doneAt: new Date().toISOString() }
  await api.archive.append(next)
  await api.tasks.delete(task.id)
}

export async function pullFromPool(task: Task, targetDate: string): Promise<void> {
  const today = todayStr()
  const ranges = task.pooledRanges.map((r, i, all) =>
    i === all.length - 1 && r.to == null ? { ...r, to: today } : r
  )
  const next: Task = { ...task, status: 'active', plannedDate: targetDate, pooledRanges: ranges }
  await api.tasks.upsert(next)
  await api.pool.remove(task.id)
}
