export type TaskStatus = 'active' | 'done' | 'abandoned' | 'pooled'

export interface PooledRange {
  from: string   // YYYY-MM-DD
  to: string | null  // null = 仍在池中
}

export interface Task {
  id: string
  title: string
  rawTitle: string
  detail: string
  plannedDate: string              // YYYY-MM-DD
  plannedTime?: string             // HH:mm
  createdAt: string                // ISO
  status: TaskStatus
  doneAt?: string                  // ISO（done/abandoned 时设）
  order: number
  attachments: string[]            // 相对路径
  originalPlannedDate: string      // YYYY-MM-DD（永不变）
  pooledRanges: PooledRange[]
}

export interface Config {
  alwaysOnTop: boolean
  immersiveMode: boolean
  shortcut: string
  windowBounds: { x?: number; y?: number; width: number; height: number }
  archiveGridBounds?: { width: number; height: number }
  dataDir: string                  // 绝对路径或 "default"
  notificationsEnabled: boolean
  backupRetentionDays: number
}

export const DEFAULT_CONFIG: Config = {
  alwaysOnTop: true,
  immersiveMode: false,
  shortcut: 'CommandOrControl+Alt+T',
  windowBounds: { width: 300, height: 360 },
  dataDir: 'default',
  notificationsEnabled: false,
  backupRetentionDays: 30,
}
