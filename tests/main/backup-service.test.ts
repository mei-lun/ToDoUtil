import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setDataDir } from '../../electron/storage/paths'
import { runDailyBackup, cleanOldBackups } from '../../electron/storage/backup-service'

let tmp: string

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-bk-'))
  setDataDir(tmp)
  fs.writeFileSync(path.join(tmp, 'tasks.json'), '[]')
  fs.writeFileSync(path.join(tmp, 'pool.json'), '[]')
  fs.writeFileSync(path.join(tmp, 'archive.json'), '[]')
})
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }))

describe('backup-service', () => {
  it('runDailyBackup creates 3 dated copies', () => {
    runDailyBackup('2026-06-23')
    const backups = fs.readdirSync(path.join(tmp, 'backups'))
    expect(backups).toContain('2026-06-23-tasks.json')
    expect(backups).toContain('2026-06-23-pool.json')
    expect(backups).toContain('2026-06-23-archive.json')
  })

  it('runDailyBackup is idempotent for same day', () => {
    runDailyBackup('2026-06-23')
    runDailyBackup('2026-06-23')
    const backups = fs.readdirSync(path.join(tmp, 'backups'))
    expect(backups.filter(n => n.startsWith('2026-06-23'))).toHaveLength(3)
  })

  it('cleanOldBackups removes files older than N days', () => {
    fs.writeFileSync(path.join(tmp, 'backups', '2026-01-01-tasks.json'), '[]')
    fs.writeFileSync(path.join(tmp, 'backups', '2026-06-22-tasks.json'), '[]')
    cleanOldBackups('2026-06-23', 30)
    const after = fs.readdirSync(path.join(tmp, 'backups'))
    expect(after).not.toContain('2026-01-01-tasks.json')
    expect(after).toContain('2026-06-22-tasks.json')
  })
})
