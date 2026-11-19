import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('../', import.meta.url)))

async function markdownFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true })
  const nested = await Promise.all(entries.filter(entry => entry.isDirectory()).map(entry => markdownFiles(join(folder, entry.name))))
  return [
    ...entries.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md')).map(entry => join(folder, entry.name)),
    ...nested.flat()
  ]
}

function parseOptions(args) {
  const staleIndex = args.indexOf('--stale-days')
  const staleDays = staleIndex < 0 ? 180 : Number(args[staleIndex + 1])
  if (!Number.isInteger(staleDays) || staleDays < 1 || staleDays > 3650) throw new Error('--stale-days must be an integer from 1 to 3650.')
  return { staleDays, json: args.includes('--json') }
}

export function extractDates(text) {
  const dates = []
  const pattern = /((?:research(?:\/current-code)?\s+(?:checked|check)|last\s+researched|last\s+reviewed|reviewed|last\s+updated|updated))\s*[:*_-]*\s*(\d{4}-\d{2}-\d{2})/gi
  for (const match of text.matchAll(pattern)) {
    const date = new Date(`${match[2]}T00:00:00Z`)
    if (!Number.isNaN(date.getTime())) dates.push({ label: match[1].toLowerCase(), value: match[2], time: date.getTime(), research: /research/i.test(match[1]) })
  }
  return dates.sort((a, b) => b.time - a.time)
}

function extractOpenTasks(lines) {
  const tasks = []
  let inTaskSection = false
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^#{1,6}\s+/.test(line)) inTaskSection = /\b(next|immediate|open|pending|todo|task|action item)s?\b/i.test(line)
    const isOpenMarker = /^\s*(?:[-*+]\s*)?\[\s\]\s+/.test(line) || /^\s*(?:[-*+]\s*)?(?:TODO|FIXME)\b/i.test(line)
    const isTaskListItem = inTaskSection && /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)
    const taskTableRow = /^\|\s*[^|]+\|.*\|\s*(?:todo|in_progress|blocked|pending|open)\s*\|/i.test(line)
    if (isOpenMarker || isTaskListItem || taskTableRow) tasks.push({ line: index + 1, text: line.trim().slice(0, 240) })
  }
  return tasks
}

export async function auditDocs(docsDirectory, { staleDays = 180, now = Date.now() } = {}) {
  const cutoff = now - staleDays * 24 * 60 * 60 * 1000
  const files = await markdownFiles(docsDirectory)
  const result = { staleDays, staleResearch: [], staleTaskDocs: [], openTaskDocs: [], undatedResearch: [] }
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    const path = relative(repoRoot, file).replaceAll('\\', '/')
    const lines = text.split(/\r?\n/)
    const dates = extractDates(text)
    const title = lines.find(line => /^#\s+/.test(line)) || ''
    const researchDoc = /(?:^|\/)research(?:\/|$)/i.test(path)
      || /^#.*\b(?:research|api availability|platform availability|integration research)\b/i.test(title)
      || dates.some(date => date.research)
    const researchDate = dates.find(date => date.research) || dates.find(date => /reviewed|updated/.test(date.label))
    const tasks = extractOpenTasks(lines)
    if (researchDoc && !researchDate) result.undatedResearch.push({ path })
    if (researchDoc && researchDate && researchDate.time < cutoff) result.staleResearch.push({ path, date: researchDate.value })
    if (tasks.length) {
      const modified = (await stat(file)).mtimeMs
      const ageDate = dates[0]?.time ?? modified
      const item = { path, date: dates[0]?.value ?? null, dateSource: dates.length ? 'document' : 'file timestamp', tasks }
      result.openTaskDocs.push(item)
      if (ageDate < cutoff) result.staleTaskDocs.push(item)
    }
  }
  return result
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const report = await auditDocs(join(repoRoot, 'docs'), options)
  if (options.json) {
    console.log(JSON.stringify(report, null, 2))
    return
  }
  console.log(`Documentation audit (stale after ${report.staleDays} days)`)
  printItems('Stale research', report.staleResearch, item => `${item.path} — checked ${item.date}`)
  printItems('Stale task documents', report.staleTaskDocs, item => `${item.path} — ${item.date || 'file timestamp'}; ${item.tasks.length} open item(s)`)
  printItems('Open task documents', report.openTaskDocs, item => `${item.path} — ${item.tasks.length} open item(s)`)
  printItems('Undated research-like documents', report.undatedResearch, item => item.path)
}

function printItems(title, items, format) {
  console.log(`\n${title}: ${items.length}`)
  for (const item of items) {
    console.log(`- ${format(item)}`)
    if (item.tasks) for (const task of item.tasks) console.log(`  L${task.line}: ${task.text}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Documentation audit failed:', error.message)
    process.exitCode = 1
  })
}
