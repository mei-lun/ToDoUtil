import { useEffect } from 'react'
import { useTasksStore } from './store/tasks-store'
import { usePoolStore } from './store/pool-store'
import { useViewStore } from './store/view-store'
import { AddInput } from './components/AddInput'
import { TopBar } from './components/TopBar'
import { TodayView } from './views/TodayView'
import { PoolView } from './views/PoolView'
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

  return (
    <div className="app">
      <AddInput />
      <TopBar poolCount={poolCount} />
      {mode === 'date' && <TodayView />}
      {mode === 'pool' && <PoolView />}
    </div>
  )
}
