import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { atomicWriteJson, readJsonOr } from '../../electron/storage/atomic-write'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('atomicWriteJson', () => {
  it('writes json and round-trips via readJsonOr', () => {
    const file = path.join(tmpDir, 'data.json')
    atomicWriteJson(file, { hello: 'world' })
    expect(readJsonOr(file, {})).toEqual({ hello: 'world' })
  })

  it('readJsonOr returns fallback when file missing', () => {
    expect(readJsonOr(path.join(tmpDir, 'missing.json'), { x: 1 })).toEqual({ x: 1 })
  })

  it('atomicWriteJson does not leave tmp file behind on success', () => {
    const file = path.join(tmpDir, 'a.json')
    atomicWriteJson(file, { a: 1 })
    expect(fs.existsSync(file + '.tmp')).toBe(false)
  })
})
