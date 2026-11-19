/**
 * Aesthetic Text Formatter & Duplicate Line Eliminator (<95 lines)
 * Removes exact/near-duplicate lines (Jaccard similarity > 0.72), normalizes typography
 * (smart quotes, em-dashes, arrows, ellipses), and applies icon/glyph bullet prefixes.
 */

export type AestheticPreset = 'editorial' | 'cyber_glyph' | 'minimal_mono' | 'punchy_hooks'

const GLYPH_BULLETS: Record<AestheticPreset, string[]> = {
  editorial: ['✦', '◈', '▹', '•'],
  cyber_glyph: ['◈', '▸', '▹', '▪'],
  minimal_mono: ['01 //', '02 //', '03 //', '04 //'],
  punchy_hooks: ['→', '▸', '▪', '•']
}

function tokenizeNormalized(line: string): Set<string> {
  const words = line.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2)
  return new Set(words)
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const token of a) {
    if (b.has(token)) intersection++
  }
  return intersection / (a.size + b.size - intersection)
}

/**
 * Removes exact and near-duplicate lines/sentences so posts never repeat the same point twice.
 */
export function deduplicateTextLines(lines: string[], similarityThreshold = 0.72): {
  uniqueLines: string[]
  removedDuplicatesCount: number
} {
  const uniqueLines: string[] = []
  const seenTokenSets: Set<string>[] = []
  const seenExact = new Set<string>()
  let removedDuplicatesCount = 0

  for (const raw of lines) {
    const cleaned = raw.replace(/^[•✦◈▹→▸▪\-*]+\s*/, '').trim()
    if (!cleaned) continue
    const canonical = cleaned.toLowerCase()
    if (seenExact.has(canonical)) {
      removedDuplicatesCount++
      continue
    }
    const tokens = tokenizeNormalized(cleaned)
    const isNearDuplicate = tokens.size >= 3 && seenTokenSets.some(prev => jaccardSimilarity(tokens, prev) >= similarityThreshold)
    if (isNearDuplicate) {
      removedDuplicatesCount++
      continue
    }
    seenExact.add(canonical)
    seenTokenSets.push(tokens)
    uniqueLines.push(cleaned)
  }

  return { uniqueLines, removedDuplicatesCount }
}

/**
 * Applies aesthetic typographic polish (smart arrows, em-dashes, clean spacing) and glyph bullets.
 */
export function formatAestheticText(text: string, preset: AestheticPreset = 'editorial'): string {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean)
  const { uniqueLines } = deduplicateTextLines(rawLines)
  const glyphs = GLYPH_BULLETS[preset] || GLYPH_BULLETS.editorial

  return uniqueLines
    .map((line, idx) => {
      const polished = line
        .replace(/\s*->\s*/g, ' → ')
        .replace(/\s*=>\s*/g, ' ⇒ ')
        .replace(/\s+--\s+/g, ' — ')
        .replace(/\.{3,}/g, '…')
        .replace(/\s{2,}/g, ' ')
      if (uniqueLines.length === 1) return polished
      const glyph = glyphs[idx % glyphs.length]
      return `${glyph} ${polished}`
    })
    .join('\n')
}
