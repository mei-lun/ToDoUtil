import { addDays, parseYmd } from './date-utils'

export interface ParsedTitle {
  title: string
  plannedDate: string
  plannedTime?: string
}

const CN_NUM: Record<string, number> = {
  '一':1, '二':2, '两':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9, '十':10,
}

const WEEKDAY: Record<string, number> = {
  '一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '日':0, '天':0,
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

function parseTimeFragment(s: string): { time: string, length: number } | null {
  let offset = 0
  let ampm: 'am' | 'pm' | null = null
  if (s.startsWith('上午') || s.startsWith('早上')) { ampm = 'am'; offset = 2 }
  else if (s.startsWith('中午')) { ampm = 'pm'; offset = 2 }
  else if (s.startsWith('下午') || s.startsWith('晚上')) { ampm = 'pm'; offset = 2 }
  const rest = s.slice(offset)

  const colonMatch = rest.match(/^(\d{1,2}):(\d{2})/)
  if (colonMatch) {
    let h = Number(colonMatch[1])
    const mm = Number(colonMatch[2])
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    return { time: `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`, length: offset + colonMatch[0].length }
  }
  const dotMatch = rest.match(/^(\d{1,2})点(半)?/)
  if (dotMatch) {
    let h = Number(dotMatch[1])
    const half = !!dotMatch[2]
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    return { time: `${String(h).padStart(2,'0')}:${half ? '30' : '00'}`, length: offset + dotMatch[0].length }
  }
  return null
}

function tryMatchToken(rest: string, today: string): TokenMatch | null {
  let dateConsumed = 0
  let date: string | undefined

  const rel = rest.match(/^(今天|明天|后天|大后天)/)
  const nDays = rest.match(/^([\d一二两三四五六七八九十]+)天后/)
  const mdCN = rest.match(/^(\d{1,2})月(\d{1,2})日?/)
  const mdDot = rest.match(/^(\d{1,2})[.\-\/](\d{1,2})/)
  const nextWeek = rest.match(/^下周([一二三四五六日天])/)
  const thisWeek = rest.match(/^周([一二三四五六日天])/)

  if (rel) {
    date = addDays(today, { '今天':0, '明天':1, '后天':2, '大后天':3 }[rel[1]]!)
    dateConsumed = rel[0].length
  } else if (nDays) {
    const n = parseNum(nDays[1])
    if (n != null) { date = addDays(today, n); dateConsumed = nDays[0].length }
  } else if (mdCN || mdDot) {
    const md = mdCN || mdDot!
    const m = Number(md[1]), d = Number(md[2])
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const tDate = parseYmd(today)
      let year = tDate.getFullYear()
      let candidate = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      if (candidate < today) {
        year += 1
        candidate = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      }
      date = candidate; dateConsumed = md[0].length
    }
  } else if (nextWeek) {
    const target = WEEKDAY[nextWeek[1]]
    const todayDate = parseYmd(today)
    const todayDow = todayDate.getDay()
    const thisMonday = addDays(today, todayDow === 0 ? -6 : 1 - todayDow)
    const nextMonday = addDays(thisMonday, 7)
    date = addDays(nextMonday, target === 0 ? 6 : target - 1)
    dateConsumed = nextWeek[0].length
  } else if (thisWeek) {
    const target = WEEKDAY[thisWeek[1]]
    const todayDate = parseYmd(today)
    const todayDow = todayDate.getDay()
    const thisMonday = addDays(today, todayDow === 0 ? -6 : 1 - todayDow)
    let candidate = addDays(thisMonday, target === 0 ? 6 : target - 1)
    if (candidate < today) candidate = addDays(candidate, 7)
    date = candidate; dateConsumed = thisWeek[0].length
  }

  const timeFrag = parseTimeFragment(rest.slice(dateConsumed))
  if (timeFrag) {
    return { date, time: timeFrag.time, consumedLength: dateConsumed + timeFrag.length }
  }
  if (date) return { date, consumedLength: dateConsumed }

  const onlyTime = parseTimeFragment(rest)
  if (onlyTime) return { time: onlyTime.time, consumedLength: onlyTime.length }

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
