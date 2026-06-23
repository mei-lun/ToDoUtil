import { atomicWriteJson, readJsonOr } from './atomic-write'
import { paths } from './paths'
import type { Task } from '../../src/types'

export function listArchive(): Task[] {
  const arr = readJsonOr<Task[]>(paths().archive, [])
  return arr.slice().sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''))
}

export function appendToArchive(task: Task): void {
  const arr = readJsonOr<Task[]>(paths().archive, [])
  const idx = arr.findIndex(t => t.id === task.id)
  if (idx >= 0) arr[idx] = task
  else arr.push(task)
  atomicWriteJson(paths().archive, arr)
}

export function searchArchive(query: string): Task[] {
  const q = query.trim().toLowerCase()
  if (!q) return listArchive()
  return listArchive().filter(t =>
    t.title.toLowerCase().includes(q) || t.detail.toLowerCase().includes(q)
  )
}
