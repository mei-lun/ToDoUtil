import { useEffect, useMemo, useRef, useState } from 'react'
import { useTasksStore } from '../store/tasks-store'
import { useViewStore } from '../store/view-store'
import { TaskRow } from '../components/TaskRow'
import { api } from '../api'
import type { Task } from '../types'

const DRAG_THRESHOLD = 4 // px 之内算点击

interface DragState {
  taskId: string
  startX: number
  startY: number
  curX: number
  curY: number
  offsetX: number      // 鼠标距行左上角的偏移
  offsetY: number
  rowW: number
  rowH: number
  rowText: string
  active: boolean      // 是否已超过 threshold
  insertBefore: string | null // 即将插入到这个 id 之前；null=插在最后
}

export function TodayView() {
  const tasks = useTasksStore(s => s.tasks)
  const reload = useTasksStore(s => s.load)
  const currentDate = useViewStore(s => s.currentDate)
  const [drag, setDrag] = useState<DragState | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const suppressClickRef = useRef(false)

  const visible = useMemo(() => {
    return tasks
      .filter(t => t.plannedDate === currentDate)
      .sort((a, b) => {
        if (a.order === -1 && b.order !== -1) return 1
        if (b.order === -1 && a.order !== -1) return -1
        return a.order - b.order
      })
  }, [tasks, currentDate])

  function onPointerDownDrag(taskId: string, e: React.PointerEvent) {
    if (e.button !== 0) return
    const row = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const rowEl = e.currentTarget as HTMLElement
    setDrag({
      taskId,
      startX: e.clientX,
      startY: e.clientY,
      curX: e.clientX,
      curY: e.clientY,
      offsetX: e.clientX - row.left,
      offsetY: e.clientY - row.top,
      rowW: row.width,
      rowH: row.height,
      rowText: rowEl.innerText.trim().split('\n')[0] || '',
      active: false,
      insertBefore: null,
    })
  }

  // 计算当前鼠标位置 → 应插入到哪个 task.id 之前（null = 插末尾）
  function calcInsertBefore(clientY: number): string | null {
    const list = listRef.current
    if (!list) return null
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-row-id]'))
    for (const r of rows) {
      const rect = r.getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      if (clientY < mid) return r.dataset.rowId ?? null
    }
    return null
  }

  // 全局 pointermove / pointerup 监听
  useEffect(() => {
    if (!drag) return
    function onMove(e: PointerEvent) {
      setDrag(d => {
        if (!d) return d
        const dx = e.clientX - d.startX
        const dy = e.clientY - d.startY
        const active = d.active || Math.hypot(dx, dy) >= DRAG_THRESHOLD
        const insertBefore = active ? calcInsertBefore(e.clientY) : null
        return { ...d, curX: e.clientX, curY: e.clientY, active, insertBefore }
      })
    }
    async function onUp() {
      setDrag(d => {
        if (d && d.active) {
          // 阻断接下来的 click 事件（pointerup 之后浏览器会触发 click）
          suppressClickRef.current = true
          // commit reorder（异步，外面读 d 即可）
          commitReorder(d.taskId, d.insertBefore)
        }
        return null
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [drag != null])

  async function commitReorder(draggedId: string, insertBefore: string | null) {
    const arr: Task[] = visible.slice()
    const fromIdx = arr.findIndex(t => t.id === draggedId)
    if (fromIdx < 0) return
    const [m] = arr.splice(fromIdx, 1)
    const toIdx = insertBefore == null
      ? arr.length
      : arr.findIndex(t => t.id === insertBefore)
    arr.splice(toIdx < 0 ? arr.length : toIdx, 0, m)
    const reordered = arr.map((t, i) => ({ ...t, order: i + 1 }))
    const others = tasks.filter(t => t.plannedDate !== currentDate)
    await api.tasks.bulk([...others, ...reordered])
    await reload()
  }

  // 拖拽中阻断后续的 click 一次
  useEffect(() => {
    function onCaptureClick(e: MouseEvent) {
      if (suppressClickRef.current) {
        e.stopPropagation()
        e.preventDefault()
        suppressClickRef.current = false
      }
    }
    window.addEventListener('click', onCaptureClick, true)
    return () => window.removeEventListener('click', onCaptureClick, true)
  }, [])

  // autofit 窗口高度
  const viewRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const inner = innerRef.current
    const view = viewRef.current
    if (!inner || !view) return
    let raf = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const app = view.closest('.app') as HTMLElement | null
        const appRect = app?.getBoundingClientRect()
        const viewRect = view.getBoundingClientRect()
        const overhead = appRect ? (viewRect.top - appRect.top) : 80
        const needed = Math.ceil(overhead + inner.offsetHeight + 8)
        api.window.autofit(needed)
      })
    })
    ro.observe(inner)
    return () => { ro.disconnect(); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div ref={viewRef} className="today-view">
      <div ref={innerRef} className="today-list">
        {visible.length === 0 && <div className="empty-state">还没有任务</div>}
        {visible.map(t => {
          const indicatorBefore = drag?.active && drag.insertBefore === t.id
          return (
            <div key={t.id} data-row-id={t.id}>
              {indicatorBefore && <div className="drop-indicator" />}
              <TaskRow
                task={t}
                onPointerDownDrag={onPointerDownDrag}
                isDragging={drag?.active === true && drag.taskId === t.id}
              />
            </div>
          )
        })}
        {drag?.active && drag.insertBefore === null && <div className="drop-indicator" />}
      </div>
      {drag?.active && (
        <div
          className="drag-ghost"
          style={{
            left: drag.curX - drag.offsetX,
            top: drag.curY - drag.offsetY,
            width: drag.rowW,
            height: drag.rowH,
          }}
        >
          {drag.rowText}
        </div>
      )}
    </div>
  )
}
