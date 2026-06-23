import { useMemo, useState } from 'react'
import { useArchiveStore } from '../store/archive-store'
import { buildGridDays, taskCellState } from '../utils/grid-data'
import { addDays, todayStr } from '../utils/date-utils'
import { computeUsedDays } from '../utils/used-days'

type RangeKey = '1m' | '3m' | '1y' | 'all'

function rangeStart(key: RangeKey): string {
  const today = todayStr()
  switch (key) {
    case '1m': return addDays(today, -30)
    case '3m': return addDays(today, -90)
    case '1y': return addDays(today, -365)
    case 'all': return '1970-01-01'
  }
}

export function HeatmapGrid() {
  const archive = useArchiveStore(s => s.archive)
  const [range, setRange] = useState<RangeKey>('3m')

  const { days, tasks } = useMemo(() => {
    const start = rangeStart(range)
    const end = todayStr()
    const realStart = range === 'all' && archive.length > 0
      ? archive.map(t => t.originalPlannedDate).sort()[0]
      : start
    const days = buildGridDays(realStart, end)
    const tasks = archive.filter(t => (t.doneAt ?? '') >= realStart)
    return { days, tasks }
  }, [archive, range])

  return (
    <div className="heatmap">
      <div className="heatmap-range">
        {(['1m', '3m', '1y', 'all'] as RangeKey[]).map(k => (
          <button
            key={k}
            className={`view-toggle ${range === k ? 'active' : ''}`}
            onClick={() => setRange(k)}
          >
            {k === '1m' ? '近1月' : k === '3m' ? '近3月' : k === '1y' ? '近1年' : '全部'}
          </button>
        ))}
      </div>
      <div className="heatmap-scroll">
        {tasks.length === 0 ? (
          <div className="empty-state">该时间范围内无归档</div>
        ) : (
          <table className="heatmap-table">
            <thead>
              <tr>
                <th className="heatmap-task-col"></th>
                {days.map(d => (
                  <th key={d} className="heatmap-day-col" title={d}>
                    {d.endsWith('-01') ? d.slice(5, 7) + '月' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td className="heatmap-task-col" title={t.title}>{t.title}</td>
                  {days.map(d => {
                    const state = taskCellState(t, d)
                    const tip = state !== 'empty'
                      ? `${t.title}\n${t.originalPlannedDate} → ${t.doneAt?.slice(0, 10)}\n用时 ${computeUsedDays(t)} 天`
                      : undefined
                    return (
                      <td
                        key={d}
                        className={`heatmap-cell cell-${state}`}
                        title={tip}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
