import fs from 'node:fs'
import path from 'node:path'
import { paths } from './paths'

function copyIfExists(src: string, dst: string) {
  if (fs.existsSync(src)) fs.copyFileSync(src, dst)
}

export function runDailyBackup(today: string): void {
  const p = paths()
  fs.mkdirSync(p.backups, { recursive: true })
  copyIfExists(p.tasks,   path.join(p.backups, `${today}-tasks.json`))
  copyIfExists(p.pool,    path.join(p.backups, `${today}-pool.json`))
  copyIfExists(p.archive, path.join(p.backups, `${today}-archive.json`))
}

export function cleanOldBackups(today: string, retentionDays: number): void {
  const p = paths()
  if (!fs.existsSync(p.backups)) return
  const [yy, mm, dd] = today.split('-').map(Number)
  const cutoff = new Date(yy, mm - 1, dd)
  cutoff.setDate(cutoff.getDate() - retentionDays)
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`
  for (const name of fs.readdirSync(p.backups)) {
    const m = name.match(/^(\d{4}-\d{2}-\d{2})-/)
    if (m && m[1] < cutoffStr) fs.unlinkSync(path.join(p.backups, name))
  }
}
