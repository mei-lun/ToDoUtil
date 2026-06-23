import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

let cachedDataDir: string | null = null

export function setDataDir(absPath: string | 'default'): string {
  cachedDataDir = absPath === 'default' ? app.getPath('userData') : absPath
  fs.mkdirSync(cachedDataDir, { recursive: true })
  fs.mkdirSync(path.join(cachedDataDir, 'backups'), { recursive: true })
  fs.mkdirSync(path.join(cachedDataDir, 'attachments'), { recursive: true })
  fs.mkdirSync(path.join(cachedDataDir, 'logs'), { recursive: true })
  return cachedDataDir
}

export function getDataDir(): string {
  if (!cachedDataDir) cachedDataDir = setDataDir('default')
  return cachedDataDir
}

export function paths() {
  const d = getDataDir()
  return {
    tasks: path.join(d, 'tasks.json'),
    pool: path.join(d, 'pool.json'),
    archive: path.join(d, 'archive.json'),
    config: path.join(d, 'config.json'),
    attachments: path.join(d, 'attachments'),
    backups: path.join(d, 'backups'),
    logs: path.join(d, 'logs'),
  }
}
