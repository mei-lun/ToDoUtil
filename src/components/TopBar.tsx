import { useViewStore } from '../store/view-store'
import { addDays, todayStr } from '../utils/date-utils'

function fmt(d: string): string {
  const today = todayStr()
  if (d === today) return `今天 ${d.slice(5).replace('-', '/')}`
  if (d === addDays(today, 1)) return `明天 ${d.slice(5).replace('-', '/')}`
  if (d === addDays(today, -1)) return `昨天 ${d.slice(5).replace('-', '/')}`
  return d.slice(5).replace('-', '/')
}

export function TopBar({ poolCount }: { poolCount: number }) {
  const mode = useViewStore(s => s.mode)
  const currentDate = useViewStore(s => s.currentDate)
  const setDate = useViewStore(s => s.setDate)
  const setMode = useViewStore(s => s.setMode)

  if (mode !== 'date') return null

  return (
    <div className="topbar">
      <button className="icon-btn" onClick={() => setDate(addDays(currentDate, -1))} aria-label="前一天">◀</button>
      <span className="date-label">{fmt(currentDate)}</span>
      <button className="icon-btn" onClick={() => setDate(addDays(currentDate, 1))} aria-label="后一天">▶</button>
      <div className="topbar-spacer" />
      <button className="icon-btn" onClick={() => setMode('pool')} aria-label="搁置池">
        📥{poolCount > 0 && <sup>{poolCount}</sup>}
      </button>
      <button className="icon-btn" onClick={() => setMode('archive')} aria-label="归档">📚</button>
    </div>
  )
}
