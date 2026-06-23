import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { Task } from '../../src/types'

// Mock window.api BEFORE importing modules that read it at module-load time
const apiState = { tasks: [] as Task[] }
;(globalThis as any).window = globalThis.window ?? {}
;(window as any).api = {
  tasks: {
    list: vi.fn(async () => structuredClone(apiState.tasks)),
    upsert: vi.fn(async (t: Task) => {
      const i = apiState.tasks.findIndex(x => x.id === t.id)
      if (i >= 0) apiState.tasks[i] = t
      else apiState.tasks.push(t)
    }),
    delete: vi.fn(async (id: string) => {
      apiState.tasks = apiState.tasks.filter(x => x.id !== id)
    }),
    bulk: vi.fn(async (ts: Task[]) => { apiState.tasks = ts }),
  },
  pool: { list: vi.fn(async () => []), add: vi.fn(), remove: vi.fn() },
  archive: { list: vi.fn(async () => []), append: vi.fn(), search: vi.fn(async () => []) },
  config: { load: vi.fn(async () => ({})), save: vi.fn() },
}

// Now safe to import modules that depend on window.api
const { TaskDetail } = await import('../../src/components/TaskDetail')
const { useTasksStore } = await import('../../src/store/tasks-store')
const { useViewStore } = await import('../../src/store/view-store')

function makeTask(detail: string): Task {
  return {
    id: 't1', title: 'demo', rawTitle: 'demo', detail,
    plannedDate: '2026-06-23', createdAt: '2026-06-23T00:00:00Z',
    status: 'active', order: 1, attachments: [],
    originalPlannedDate: '2026-06-23', pooledRanges: [],
  }
}

describe('TaskDetail integration', () => {
  beforeEach(async () => {
    apiState.tasks = []
    await useTasksStore.getState().load()
    useViewStore.setState({ editingTaskId: null, expandedTaskId: null })
  })

  it('shows empty marker when detail is blank', () => {
    render(<TaskDetail task={makeTask('')} />)
    expect(screen.getByText('（无内容）')).toBeTruthy()
  })

  it('renders subtask checkboxes that are clickable (type=checkbox, no disabled)', () => {
    render(<TaskDetail task={makeTask('- [ ] foo\n- [x] bar')} />)
    const cbs = document.querySelectorAll('.md-view input[type="checkbox"]')
    expect(cbs.length).toBe(2)
    cbs.forEach(cb => expect((cb as HTMLInputElement).disabled).toBe(false))
  })

  it('clicking a checkbox toggles the source via upsert', async () => {
    const task = makeTask('- [ ] foo\n- [x] bar')
    apiState.tasks = [task]
    await useTasksStore.getState().load()

    render(<TaskDetail task={task} />)
    const cbs = document.querySelectorAll('.md-view input[type="checkbox"]')
    await act(async () => {
      ;(cbs[0] as HTMLInputElement).click()
    })

    expect((window as any).api.tasks.upsert).toHaveBeenCalled()
    expect(apiState.tasks[0].detail).toBe('- [x] foo\n- [x] bar')
  })

  it('saves edits on blur and exits editing mode', async () => {
    const task = makeTask('original')
    apiState.tasks = [task]
    await useTasksStore.getState().load()
    useViewStore.setState({ editingTaskId: 't1' })

    render(<TaskDetail task={task} />)
    const ta = screen.getByPlaceholderText('写点什么…支持 markdown') as HTMLTextAreaElement
    await act(async () => {
      fireEvent.change(ta, { target: { value: 'updated content' } })
      fireEvent.blur(ta)
    })

    expect(apiState.tasks[0].detail).toBe('updated content')
    expect(useViewStore.getState().editingTaskId).toBeNull()
  })

  it('Ctrl+S saves and exits editing mode', async () => {
    const task = makeTask('a')
    apiState.tasks = [task]
    await useTasksStore.getState().load()
    useViewStore.setState({ editingTaskId: 't1' })

    render(<TaskDetail task={task} />)
    const ta = screen.getByPlaceholderText('写点什么…支持 markdown') as HTMLTextAreaElement
    await act(async () => {
      fireEvent.change(ta, { target: { value: 'b' } })
      fireEvent.keyDown(ta, { key: 's', ctrlKey: true })
    })

    expect(apiState.tasks[0].detail).toBe('b')
    expect(useViewStore.getState().editingTaskId).toBeNull()
  })

  it('Esc on dirty content prompts; cancel keeps editing', async () => {
    const task = makeTask('a')
    apiState.tasks = [task]
    await useTasksStore.getState().load()
    useViewStore.setState({ editingTaskId: 't1' })

    render(<TaskDetail task={task} />)
    const ta = screen.getByPlaceholderText('写点什么…支持 markdown') as HTMLTextAreaElement
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await act(async () => {
      fireEvent.change(ta, { target: { value: 'changed' } })
      fireEvent.keyDown(ta, { key: 'Escape' })
    })
    expect(confirmSpy).toHaveBeenCalled()
    expect(useViewStore.getState().editingTaskId).toBe('t1')
    confirmSpy.mockRestore()
  })

  it('Esc on dirty content with confirm=true discards and exits editing', async () => {
    const task = makeTask('a')
    apiState.tasks = [task]
    await useTasksStore.getState().load()
    useViewStore.setState({ editingTaskId: 't1' })

    render(<TaskDetail task={task} />)
    const ta = screen.getByPlaceholderText('写点什么…支持 markdown') as HTMLTextAreaElement
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    // Pre-empt onBlur (which would save) by handling Esc first; the textarea
    // remains focused during the keyDown so blur won't fire as part of keyDown.
    await act(async () => {
      fireEvent.change(ta, { target: { value: 'changed' } })
      fireEvent.keyDown(ta, { key: 'Escape' })
    })
    expect(confirmSpy).toHaveBeenCalled()
    expect(useViewStore.getState().editingTaskId).toBeNull()
    confirmSpy.mockRestore()
  })
})
