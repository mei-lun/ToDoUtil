import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { paths } from './paths'

export function resolveAttachmentPath(dataDir: string, urlPath: string): string | null {
  try {
    const decoded = decodeURIComponent(urlPath)
    const root = path.resolve(dataDir, 'attachments')
    const resolved = path.resolve(root, decoded)
    if (resolved === root || resolved.startsWith(root + path.sep)) return resolved
    return null
  } catch {
    return null
  }
}

export function saveImageBuffer(taskId: string, buf: Buffer, ext: string): string {
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)
  const dir = path.join(paths().attachments, taskId)
  fs.mkdirSync(dir, { recursive: true })
  const filename = `${hash}.${ext.replace(/^\./, '')}`
  const abs = path.join(dir, filename)
  if (!fs.existsSync(abs)) fs.writeFileSync(abs, buf)
  return `attachments://${taskId}/${filename}`
}

export function removeTaskAttachments(taskId: string): void {
  const dir = path.join(paths().attachments, taskId)
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}
