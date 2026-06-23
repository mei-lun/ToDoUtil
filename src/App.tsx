import { useEffect } from 'react'
import { useTasksStore } from './store/tasks-store'
import { usePoolStore } from './store/pool-store'
import { useViewStore } from './store/view-store'
import { AddInput } from './components/AddInput'
import { TopBar } from './components/TopBar'
import { TodayView } from './views/TodayView'
import { PoolView } from './views/PoolView'
import { ArchiveView } from './views/ArchiveView'
import { MoveModeOverlay } from './components/MoveModeOverlay'
import { api } from './api'

export default function App() {
  const loadTasks = useTasksStore(s => s.load)
  const loadPool = usePoolStore(s => s.load)
  const poolCount = usePoolStore(s => s.pool.length)
  const mode = useViewStore(s => s.mode)

  useEffect(() => {
    loadTasks()
    loadPool()
  }, [])

  useEffect(() => {
    const off = api.events.onTasksRolled(() => {
      useTasksStore.getState().load()
    })
    return () => off()
  }, [])

  useEffect(() => {
    const offMove = api.window.onMoveMode((on) => {
      useViewStore.getState().setMoveMode(on)
    })
    return () => offMove()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // If a local React handler (e.g. AddInput/MarkdownEditor) already called
      // preventDefault, treat the Esc as handled and skip the cascade — keeps
      // the cascade single-action.
      if (e.defaultPrevented) return
      const v = useViewStore.getState()
      if (v.moveMode) { v.setMoveMode(false); return }
      if (v.addInputOpen) { v.setAddInputOpen(false); return }
      if (v.editingTaskId) { v.setEditing(null); return }
      if (v.expandedTaskId) { v.toggleExpand(v.expandedTaskId); return }
      api.window.hide()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="app">
      <AddInput />
      <TopBar poolCount={poolCount} />
      {mode === 'date' && <TodayView />}
      {mode === 'pool' && <PoolView />}
      {mode === 'archive' && <ArchiveView />}
      <MoveModeOverlay />
    </div>
  )
}
