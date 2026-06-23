import { BrowserWindow } from 'electron'
import * as tasksRepo from './storage/tasks-repo'

function todayLocalStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function rollOverdueTasks(): number {
  const today = todayLocalStr()
  const all = tasksRepo.listTasks()
  let count = 0
  const updated = all.map((t) => {
    if (t.status === 'active' && t.plannedDate < today) {
      count++
      return { ...t, plannedDate: today }
    }
    return t
  })
  if (count > 0) {
    tasksRepo.bulkReplace(updated)
    BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('tasks:rolled'))
  }
  return count
}

let nextTimer: NodeJS.Timeout | null = null
let backupInterval: NodeJS.Timeout | null = null

function scheduleNextMidnight() {
  if (nextTimer) clearTimeout(nextTimer)
  const now = new Date()
  const nextMid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5)
  const delay = Math.max(1000, nextMid.getTime() - now.getTime())
  nextTimer = setTimeout(() => {
    rollOverdueTasks()
    scheduleNextMidnight()
  }, delay)
}

export function startScheduler() {
  rollOverdueTasks()
  scheduleNextMidnight()
  if (backupInterval) clearInterval(backupInterval)
  backupInterval = setInterval(() => {
    rollOverdueTasks()
  }, 60_000)
}

export function stopScheduler() {
  if (nextTimer) {
    clearTimeout(nextTimer)
    nextTimer = null
  }
  if (backupInterval) {
    clearInterval(backupInterval)
    backupInterval = null
  }
}
