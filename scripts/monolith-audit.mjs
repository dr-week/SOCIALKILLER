import { readFile } from 'node:fs/promises'
import { relative, resolve, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { collectProjectSourceFiles } from './check-file-size.mjs'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const defaultLineLimit = 149

export function splitSuggestion(file) {
  const path = file.replaceAll('\\', '/').toLowerCase()
  if (/\.((test)|(spec))\.[cm]?[jt]sx?$/.test(path)) return 'Split tests by behavior; move shared setup into a local fixture module.'
  if (/^server\/routes\//.test(path)) return 'Split endpoint groups by feature; keep request validation and response mapping at the HTTP edge.'
  if (/^server\/db\//.test(path)) return 'Separate migrations, repository queries, and domain policy while preserving data contracts.'
  if (/^server\/(marketing|modules)\//.test(path)) return 'Extract a cohesive use case or domain policy; keep orchestration and provider work behind existing contracts.'
  if (/^src\/.*\.(css|scss)$/.test(path)) return 'Split styles by owning component or workspace; keep shared tokens in the feature design system.'
  if (/^src\/.*\.vue$/.test(path)) return 'Extract cohesive UI sections into feature-owned components; keep state and workflow coordination explicit.'
  if (/^src\/(composables|domain)\//.test(path)) return 'Separate independent state or domain responsibilities into feature-owned modules with small typed contracts.'
  if (/^extension\//.test(path)) return 'Split by message handling, storage, or page behavior while preserving permissions and message contracts.'
  if (/^scripts\//.test(path)) return 'Separate command parsing, reporting logic, and filesystem/network I/O into testable responsibilities.'
  if (/^(android|src-tauri)\//.test(path)) return 'Split by native capability and platform boundary; keep entry points and cross-layer contracts narrow.'
  return 'Trace callers and tests, then extract one cohesive responsibility into its owning feature layer.'
}

export function classifyCandidate(file, lines, baseline, lineLimit = defaultLineLimit) {
  if (lines <= lineLimit) return null
  const baselineLines = baseline[file]
  const status = baselineLines === undefined
    ? 'unbaselined'
    : lines > baselineLines ? 'grown' : 'legacy'
  return { file, lines, status, baselineLines }
}

export function parseLineLimit(args) {
  const option = args.find(argument => argument.startsWith('--over='))
  const limit = option ? Number(option.slice('--over='.length)) : defaultLineLimit
  if (!Number.isInteger(limit) || limit < 1 || limit > 2000) {
    throw new Error('--over must be an integer from 1 to 2000')
  }
  return limit
}

export async function buildMonolithAudit(projectRoot = root, lineLimit = defaultLineLimit) {
  const baseline = JSON.parse(await readFile(join(projectRoot, 'scripts', 'file-size-baseline.json'), 'utf8'))
  const paths = await collectProjectSourceFiles(projectRoot)
  const candidates = []
  for (const path of paths) {
    const source = await readFile(path, 'utf8')
    const trimmed = source.trimEnd()
    const lines = trimmed ? trimmed.split(/\r?\n/).length : 0
    const file = relative(projectRoot, path).replaceAll('\\', '/')
    const candidate = classifyCandidate(file, lines, baseline, lineLimit)
    if (candidate) candidates.push({ ...candidate, suggestion: splitSuggestion(file) })
  }
  candidates.sort((left, right) => right.lines - left.lines || left.file.localeCompare(right.file))
  return { scannedFiles: paths.length, lineLimit, candidates }
}

function printReport(report) {
  const totals = report.candidates.reduce((counts, candidate) => {
    counts[candidate.status] += 1
    return counts
  }, { grown: 0, unbaselined: 0, legacy: 0 })
  console.log(`Scanned ${report.scannedFiles} source files; ${report.candidates.length} exceed ${report.lineLimit} lines.`)
  console.log(`Status: ${totals.grown} grew beyond baseline; ${totals.unbaselined} unbaselined; ${totals.legacy} legacy within baseline.`)
  for (const candidate of report.candidates) {
    const baseline = candidate.baselineLines === undefined ? '' : `; baseline ${candidate.baselineLines}`
    console.log(`${candidate.status.toUpperCase()} ${candidate.file}: ${candidate.lines} lines${baseline}`)
    console.log(`  Suggestion: ${candidate.suggestion}`)
  }
}

async function main() {
  const lineLimit = parseLineLimit(process.argv.slice(2))
  const report = await buildMonolithAudit(root, lineLimit)
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else printReport(report)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Monolith audit failed:', error.message)
    process.exitCode = 1
  })
}
