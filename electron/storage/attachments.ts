import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { paths } from './paths'

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
