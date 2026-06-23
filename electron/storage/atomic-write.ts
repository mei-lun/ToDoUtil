import fs from 'node:fs'
import path from 'node:path'

export function atomicWriteJson(file: string, data: unknown): void {
  const dir = path.dirname(file)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8')
  fs.renameSync(tmp, file)
}

export function readJsonOr<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback
    const raw = fs.readFileSync(file, 'utf-8')
    if (!raw.trim()) return fallback
    return JSON.parse(raw) as T
  } catch {
    quarantineCorrupted(file)
    const restored = tryRestoreFromBackup(file)
    if (restored !== null) return restored as T
    return fallback
  }
}

function quarantineCorrupted(file: string): void {
  try {
    if (!fs.existsSync(file)) return
    const dir = path.join(path.dirname(file), '.corrupted')
    fs.mkdirSync(dir, { recursive: true })
    const ts = Date.now()
    fs.copyFileSync(file, path.join(dir, `${path.basename(file)}.${ts}`))
  } catch {
    /* swallow — recovery is best-effort */
  }
}

function tryRestoreFromBackup(file: string): unknown | null {
  try {
    const base = path.basename(file)
    const backups = path.join(path.dirname(file), 'backups')
    if (!fs.existsSync(backups)) return null
    const names = fs.readdirSync(backups)
      .filter(n => n.endsWith(`-${base}`))
      .sort()
      .reverse()
    for (const n of names) {
      try {
        const raw = fs.readFileSync(path.join(backups, n), 'utf-8')
        return JSON.parse(raw)
      } catch {
        continue
      }
    }
    return null
  } catch {
    return null
  }
}
