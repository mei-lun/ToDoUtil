import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setDataDir } from '../../electron/storage/paths'
import { saveImageBuffer, removeTaskAttachments, resolveAttachmentPath } from '../../electron/storage/attachments'

let tmp: string
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-att-'))
  setDataDir(tmp)
})
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }))

describe('attachments', () => {
  it('saveImageBuffer creates a file and returns attachments:// URL', () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])
    const url = saveImageBuffer('task-1', buf, 'png')
    expect(url).toMatch(/^attachments:\/\/task-1\/[0-9a-f]+\.png$/)
    const filename = url.replace('attachments://task-1/', '')
    expect(fs.existsSync(path.join(tmp, 'attachments', 'task-1', filename))).toBe(true)
  })

  it('saveImageBuffer dedupes identical content via hash', () => {
    const buf = Buffer.from([1, 2, 3])
    const a = saveImageBuffer('t', buf, 'png')
    const b = saveImageBuffer('t', buf, 'png')
    expect(a).toBe(b)
    expect(fs.readdirSync(path.join(tmp, 'attachments', 't'))).toHaveLength(1)
  })

  it('removeTaskAttachments removes the dir', () => {
    saveImageBuffer('t', Buffer.from([0]), 'png')
    removeTaskAttachments('t')
    expect(fs.existsSync(path.join(tmp, 'attachments', 't'))).toBe(false)
  })
})

describe('resolveAttachmentPath', () => {
  it('resolves valid relative path', () => {
    const dir = '/tmp/data'
    expect(resolveAttachmentPath(dir, 'task-1/abc.png')).toMatch(/attachments[\\\/]task-1[\\\/]abc\.png$/)
  })
  it('rejects ../ traversal', () => {
    expect(resolveAttachmentPath('/tmp/data', '../../../etc/passwd')).toBeNull()
  })
  it('rejects percent-encoded ../ traversal', () => {
    expect(resolveAttachmentPath('/tmp/data', '%2e%2e/%2e%2e/secret')).toBeNull()
  })
  it('rejects malformed URI', () => {
    expect(resolveAttachmentPath('/tmp/data', '%E0%A4%A')).toBeNull()
  })
})
