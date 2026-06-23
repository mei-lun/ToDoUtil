import { atomicWriteJson, readJsonOr } from './atomic-write'
import { paths } from './paths'
import type { Task } from '../../src/types'

export function listPool(): Task[] {
  return readJsonOr<Task[]>(paths().pool, [])
}

export function addToPool(task: Task): void {
  const pool = listPool().filter(t => t.id !== task.id)
  pool.push(task)
  atomicWriteJson(paths().pool, pool)
}

export function removeFromPool(id: string): void {
  const pool = listPool().filter(t => t.id !== id)
  atomicWriteJson(paths().pool, pool)
}
