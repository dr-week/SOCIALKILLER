import Fuse from 'fuse.js'

export function scoreFuzzyMatch(query: string, text: string): number {
  const q = query.trim().toLowerCase()
  const target = (text || '').trim().toLowerCase()
  if (!q || !target) return 0
  if (target.startsWith(q)) return 100
  const idx = target.indexOf(q)
  if (idx !== -1) {
    const boundary = idx === 0 || /[\s\-_/.:]/.test(target[idx - 1])
    return boundary ? 80 : 60
  }

  let qi = 0
  let streak = 0
  let maxStreak = 0
  for (let ti = 0; ti < target.length && qi < q.length; ti++) {
    if (target[ti] === q[qi]) {
      qi++
      streak++
      if (streak > maxStreak) maxStreak = streak
    } else {
      streak = 0
    }
  }
  return qi < q.length ? 0 : 35 + Math.min(20, maxStreak * 4)
}

export function rankFuzzyItems<T>(
  items: readonly T[],
  query: string,
  getFields: (item: T) => string[]
): T[] {
  const q = query.trim()
  if (!q) return [...items]

  const records = items.map((item, index) => {
    const fields = getFields(item)
    const directScore = Math.max(0, ...fields.map((field, i) => scoreFuzzyMatch(q, field) * (i === 0 ? 1.2 : 0.9)))
    return { item, primary: fields[0] || '', rest: fields.slice(1).join(' '), directScore, index }
  })

  const fuse = new Fuse(records, {
    keys: [{ name: 'primary', weight: 2 }, { name: 'rest', weight: 0.7 }],
    threshold: 0.42,
    ignoreLocation: true,
    includeScore: true
  })

  const fuseScores = new Map<number, number>()
  for (const hit of fuse.search(q)) {
    fuseScores.set(hit.item.index, Math.round((1 - (hit.score ?? 0.5)) * 75))
  }

  return records
    .map(r => ({ ...r, total: Math.max(r.directScore, fuseScores.get(r.index) || 0) }))
    .filter(r => r.total > 0)
    .sort((a, b) => (b.total - a.total) || (a.index - b.index))
    .map(r => r.item)
}
