import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setDataDir } from '../../electron/storage/paths'
import { listArchive, appendToArchive, searchArchive } from '../../electron/storage/archive-repo'
import type { Task } from '../../src/types'

let tmp: string

function ar(id: string, title: string, doneAt: string): Task {
  return {
    id, title, rawTitle: title, detail: '',
    plannedDate: '2026-06-20', createdAt: '2026-06-20T00:00:00Z',
    status: 'done', doneAt, order: 0, attachments: [],
    originalPlannedDate: '2026-06-20', pooledRanges: [],
  }
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-archive-'))
  setDataDir(tmp)
})
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }))

describe('archive-repo', () => {
  it('starts empty', () => expect(listArchive()).toEqual([]))

  it('append adds to archive', () => {
    appendToArchive(ar('a', 'foo', '2026-06-22T10:00:00Z'))
    expect(listArchive()).toHaveLength(1)
  })

  it('listArchive returns doneAt-desc order', () => {
    appendToArchive(ar('a', 'foo', '2026-06-22T00:00:00Z'))
    appendToArchive(ar('b', 'bar', '2026-06-23T00:00:00Z'))
    appendToArchive(ar('c', 'baz', '2026-06-21T00:00:00Z'))
    expect(listArchive().map(t => t.id)).toEqual(['b', 'a', 'c'])
  })

  it('searchArchive matches title (case-insensitive)', () => {
    appendToArchive(ar('a', 'Buy Milk', '2026-06-22T00:00:00Z'))
    appendToArchive(ar('b', 'Write doc', '2026-06-23T00:00:00Z'))
    expect(searchArchive('milk').map(t => t.id)).toEqual(['a'])
    expect(searchArchive('MILK').map(t => t.id)).toEqual(['a'])
  })

  it('searchArchive matches detail markdown', () => {
    const t1 = { ...ar('a', 'X', '2026-06-22T00:00:00Z'), detail: 'meeting **agenda** here' }
    appendToArchive(t1)
    expect(searchArchive('agenda').map(x => x.id)).toEqual(['a'])
  })
})
