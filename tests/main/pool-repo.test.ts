import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setDataDir } from '../../electron/storage/paths'
import { listPool, addToPool, removeFromPool } from '../../electron/storage/pool-repo'
import type { Task } from '../../src/types'

let tmp: string

function t(id: string): Task {
  return {
    id, title: id, rawTitle: id, detail: '',
    plannedDate: '2026-06-23', createdAt: '2026-06-23T00:00:00Z',
    status: 'pooled', order: 0, attachments: [],
    originalPlannedDate: '2026-06-23', pooledRanges: [{from: '2026-06-23', to: null}],
  }
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-pool-'))
  setDataDir(tmp)
})
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }))

describe('pool-repo', () => {
  it('starts empty', () => expect(listPool()).toEqual([]))

  it('addToPool adds', () => {
    addToPool(t('p1'))
    expect(listPool()).toHaveLength(1)
  })

  it('removeFromPool removes', () => {
    addToPool(t('p1'))
    addToPool(t('p2'))
    removeFromPool('p1')
    expect(listPool().map(x => x.id)).toEqual(['p2'])
  })

  it('addToPool replaces by id', () => {
    addToPool({ ...t('p1'), title: 'old' })
    addToPool({ ...t('p1'), title: 'new' })
    expect(listPool()[0].title).toBe('new')
  })
})
