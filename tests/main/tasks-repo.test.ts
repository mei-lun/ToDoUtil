import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setDataDir } from '../../electron/storage/paths'
import { listTasks, upsertTask, deleteTask } from '../../electron/storage/tasks-repo'
import type { Task } from '../../src/types'

let tmpDir: string

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1', title: 'A', rawTitle: 'A', detail: '',
    plannedDate: '2026-06-23', createdAt: '2026-06-23T00:00:00Z',
    status: 'active', order: 0, attachments: [],
    originalPlannedDate: '2026-06-23', pooledRanges: [],
    ...overrides,
  }
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-tasks-'))
  setDataDir(tmpDir)
})
afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }))

describe('tasks-repo', () => {
  it('starts with empty list', () => {
    expect(listTasks()).toEqual([])
  })

  it('upsert adds a new task', () => {
    upsertTask(makeTask())
    expect(listTasks()).toHaveLength(1)
  })

  it('upsert updates existing task by id', () => {
    upsertTask(makeTask({ title: 'A' }))
    upsertTask(makeTask({ title: 'B' }))
    const tasks = listTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('B')
  })

  it('deleteTask removes by id', () => {
    upsertTask(makeTask())
    deleteTask('t1')
    expect(listTasks()).toEqual([])
  })

  it('persists across reads', () => {
    upsertTask(makeTask({ id: 'a' }))
    upsertTask(makeTask({ id: 'b' }))
    expect(listTasks().map(t => t.id).sort()).toEqual(['a', 'b'])
  })
})
