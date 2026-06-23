import { useMemo, useState } from 'react'
import { useArchiveStore } from '../store/archive-store'
import { computeUsedDays, usedDaysToBarWidth } from '../utils/used-days'
import { MarkdownView } from './MarkdownView'
import type { Task } from '../types'

function groupByDoneDate(tasks: Task[]): Array<[string, Task[]]> {
  const groups = new Map<string, Task[]>()
  for (const t of tasks) {
    const day = (t.doneAt ?? '').slice(0, 10)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day)!.push(t)
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export function Timeline() {
  const archive = useArchiveStore(s => s.archive)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const groups = useMemo(() => groupByDoneDate(archive), [archive])

  return (
    <div className="timeline">
      {groups.length === 0 && <div className="empty-state">归档为空</div>}
      {groups.map(([day, items]) => (
        <div key={day} className="timeline-group">
          <div className="timeline-day">{day}</div>
          {items.map(t => {
            const used = computeUsedDays(t)
            const width = usedDaysToBarWidth(used)
            const isAbandoned = t.status === 'abandoned'
            return (
              <div key={t.id} className={`archive-row ${isAbandoned ? 'is-abandoned' : ''}`}>
                <div className="archive-line" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                  <span className="archive-icon">{isAbandoned ? '✗' : '✓'}</span>
                  <span className="archive-title">{t.title}</span>
                  <span className="archive-bar" style={{ width }} />
                  <span className="archive-days">{used}天</span>
                </div>
                {expandedId === t.id && (
                  <div className="archive-detail">
                    <MarkdownView source={t.detail || '（无内容）'} readOnly />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
