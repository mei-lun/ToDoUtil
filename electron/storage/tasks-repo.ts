import { atomicWriteJson, readJsonOr } from './atomic-write'
import { paths } from './paths'
import type { Task } from '../../src/types'

export function listTasks(): Task[] {
  return readJsonOr<Task[]>(paths().tasks, [])
}

export function upsertTask(task: Task): void {
  const tasks = listTasks()
  const idx = tasks.findIndex(t => t.id === task.id)
  if (idx >= 0) tasks[idx] = task
  else tasks.push(task)
  atomicWriteJson(paths().tasks, tasks)
}

export function deleteTask(id: string): void {
  const tasks = listTasks().filter(t => t.id !== id)
  atomicWriteJson(paths().tasks, tasks)
}

export function purgeTask(id: string): void {
  deleteTask(id)
  // 附件清理留给 attachments 模块独立处理（避免循环依赖）
}

export function bulkReplace(tasks: Task[]): void {
  atomicWriteJson(paths().tasks, tasks)
}
