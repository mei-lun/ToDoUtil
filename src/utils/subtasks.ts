const RE = /^(\s*[-*]\s*)\[( |x|X)\]/gm

export function countSubtasks(md: string): { done: number, total: number } {
  let done = 0, total = 0
  for (const m of md.matchAll(RE)) {
    total++
    if (m[2].toLowerCase() === 'x') done++
  }
  return { done, total }
}

export function toggleSubtaskAt(md: string, index: number): string {
  let i = 0
  return md.replace(RE, (full, prefix, mark) => {
    if (i++ !== index) return full
    const next = mark.toLowerCase() === 'x' ? ' ' : 'x'
    return `${prefix}[${next}]`
  })
}
