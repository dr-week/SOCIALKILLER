import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const dayMs = 24 * 60 * 60 * 1000
const statuses = new Set(['proposed', 'in_progress', 'done', 'blocked'])

export function inspectSources(sources, now = new Date(), staleAfterDays = 180) {
  const errors = []
  const stale = []
  if (!Array.isArray(sources) || sources.length === 0) {
    return { errors: ['Research source register must be a non-empty array.'], stale }
  }
  const today = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`)
  const ids = new Set()
  for (const [index, source] of sources.entries()) {
    const label = source?.id || `source ${index + 1}`
    if (!source || typeof source !== 'object') {
      errors.push(`${label} must be an object.`)
      continue
    }
    if (!source.id || ids.has(source.id)) errors.push(`${label} has a missing or duplicate id.`)
    ids.add(source.id)
    for (const key of ['product', 'sourceType', 'evidence', 'designTakeaway', 'limitations']) {
      if (typeof source[key] !== 'string' || !source[key].trim()) errors.push(`${label} is missing ${key}.`)
    }
    try {
      const url = new URL(source.url)
      if (url.protocol !== 'https:') errors.push(`${label} must use an https URL.`)
    } catch {
      errors.push(`${label} has an invalid URL.`)
    }
    const reviewedOn = source.reviewedOn || ''
    const reviewed = new Date(`${reviewedOn}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn) ||
      Number.isNaN(reviewed.valueOf()) || reviewed.toISOString().slice(0, 10) !== reviewedOn) {
      errors.push(`${label} has an invalid reviewedOn date.`)
      continue
    }
    if (reviewed > today) errors.push(`${label} has a future reviewedOn date.`)
    const ageDays = Math.floor((today - reviewed) / dayMs)
    if (ageDays > staleAfterDays) stale.push({ id: label, ageDays })
  }
  return { errors, stale }
}

export function inspectPhases(phases) {
  const errors = []
  if (!Array.isArray(phases) || phases.length === 0) {
    return { errors: ['Roadmap phases must be a non-empty array.'], readiness: [] }
  }
  const byId = new Map()
  for (const [index, phase] of phases.entries()) {
    if (!phase || typeof phase !== 'object' || typeof phase.id !== 'string' || !phase.id || !phase.title) {
      errors.push(`Phase ${index + 1} needs an id and title.`)
      continue
    }
    if (byId.has(phase.id)) errors.push(`Duplicate phase id: ${phase.id}.`)
    byId.set(phase.id, phase)
    if (!statuses.has(phase.status)) errors.push(`${phase.id} has an invalid status.`)
    if (!Array.isArray(phase.dependsOn)) errors.push(`${phase.id} dependsOn must be an array.`)
    if (typeof phase.exitCriteria !== 'string' || !phase.exitCriteria.trim()) {
      errors.push(`${phase.id} is missing exitCriteria.`)
    }
  }
  for (const phase of phases) {
    for (const dependency of Array.isArray(phase?.dependsOn) ? phase.dependsOn : []) {
      if (!byId.has(dependency)) errors.push(`${phase.id} depends on unknown phase ${dependency}.`)
      if (phase.id === dependency) errors.push(`${phase.id} cannot depend on itself.`)
    }
  }

  const visited = new Set()
  const visiting = new Set()
  function visit(id) {
    if (visiting.has(id)) {
      errors.push(`Roadmap dependency cycle includes ${id}.`)
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    for (const dependency of byId.get(id)?.dependsOn || []) {
      if (byId.has(dependency)) visit(dependency)
    }
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of byId.keys()) visit(id)

  const readiness = phases.filter(phase => phase?.id).map(phase => {
    if (phase.status === 'done') return { id: phase.id, state: 'done', waitingOn: [] }
    if (phase.status === 'blocked') return { id: phase.id, state: 'blocked', waitingOn: [] }
    const waitingOn = (phase.dependsOn || []).filter(id => byId.get(id)?.status !== 'done')
    return {
      id: phase.id,
      state: waitingOn.length ? 'waiting' : phase.status === 'in_progress' ? 'in_progress' : 'ready',
      waitingOn
    }
  })
  return { errors: [...new Set(errors)], readiness }
}

async function main() {
  const sourcesPath = resolve(root, 'docs/product/uiux/research/sources.json')
  const phasesPath = resolve(root, 'docs/product/uiux/planning/phases.json')
  const [sources, phases] = await Promise.all([
    readFile(sourcesPath, 'utf8').then(JSON.parse),
    readFile(phasesPath, 'utf8').then(JSON.parse)
  ])
  const sourceResult = inspectSources(sources)
  const phaseResult = inspectPhases(phases)
  console.log(`Research sources: ${sources.length}`)
  console.log(`Stale sources (>180 days): ${sourceResult.stale.length || 'none'}`)
  for (const source of sourceResult.stale) console.log(`  REVIEW ${source.id} (${source.ageDays} days old)`)
  console.log('Roadmap readiness:')
  for (const phase of phaseResult.readiness) {
    const waiting = phase.waitingOn.length ? `; waiting on ${phase.waitingOn.join(', ')}` : ''
    console.log(`  ${phase.state.toUpperCase()}: ${phase.id}${waiting}`)
  }
  const errors = [...sourceResult.errors, ...phaseResult.errors]
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('UI/UX plan check failed:', error.message)
    process.exitCode = 1
  })
}
