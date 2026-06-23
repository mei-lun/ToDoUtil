import { useEffect, useState } from 'react'
import { useViewStore } from '../store/view-store'
import { useArchiveStore } from '../store/archive-store'
import { Timeline } from '../components/Timeline'
import { HeatmapGrid } from '../components/HeatmapGrid'
import { api } from '../api'

export function ArchiveView() {
  const setMode = useViewStore(s => s.setMode)
  const load = useArchiveStore(s => s.load)
  const setQuery = useArchiveStore(s => s.setQuery)
  const query = useArchiveStore(s => s.query)
  const [view, setView] = useState<'timeline' | 'grid'>('timeline')

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (view !== 'grid') return
    api.window.enterGrid()
    return () => { api.window.exitGrid() }
  }, [view])

  return (
    <div className="archive-view">
      <div className="subview-bar">
        <button className="icon-btn" onClick={() => setMode('date')}>◀ 返回</button>
        <span className="date-label">归档</span>
        <div className="topbar-spacer" />
        <button className={`view-toggle ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>时间线</button>
        <button className={`view-toggle ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>网格</button>
      </div>
      <div className="archive-search-bar">
        <input
          className="archive-search"
          placeholder="🔍 搜索归档…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {view === 'timeline' && <Timeline />}
      {view === 'grid' && <HeatmapGrid />}
    </div>
  )
}
