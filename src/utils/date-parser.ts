import { addDays, parseYmd } from './date-utils'

export interface ParsedTitle {
  title: string
  plannedDate: string
  plannedTime?: string
}

const CN_NUM: Record<string, number> = {
  '一':1, '二':2, '两':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9, '十':10,
}

function parseNum(s: string): number | null {
  if (/^\d+$/.test(s)) return Number(s)
  if (CN_NUM[s] != null) return CN_NUM[s]
  return null
}

interface TokenMatch {
  date?: string
  time?: string
  consumedLength: number
}

function tryMatchToken(rest: string, today: string): TokenMatch | null {
  const rel = rest.match(/^(今天|明天|后天|大后天)/)
  if (rel) {
    const off = { '今天':0, '明天':1, '后天':2, '大后天':3 }[rel[1]]!
    return { date: addDays(today, off), consumedLength: rel[0].length }
  }
  const nDays = rest.match(/^([\d一二两三四五六七八九十]+)天后/)
  if (nDays) {
    const n = parseNum(nDays[1])
    if (n != null) return { date: addDays(today, n), consumedLength: nDays[0].length }
  }
  return null
}

export function parseRawTitle(raw: string, today: string): ParsedTitle {
  let title = raw
  let plannedDate = today
  let plannedTime: string | undefined

  const atRe = /@(\S+)/g
  let m: RegExpExecArray | null
  const consumed: Array<{start: number, end: number}> = []
  while ((m = atRe.exec(raw)) !== null) {
    const matched = tryMatchToken(m[1], today)
    if (matched) {
      if (matched.date) plannedDate = matched.date
      if (matched.time) plannedTime = matched.time
      consumed.push({ start: m.index, end: m.index + 1 + matched.consumedLength })
    }
  }

  consumed.sort((a, b) => b.start - a.start)
  for (const c of consumed) {
    title = (title.slice(0, c.start) + title.slice(c.end))
  }
  title = title.replace(/\s+/g, ' ').trim()

  return { title, plannedDate, plannedTime }
}
