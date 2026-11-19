import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const SRC_EXTS = new Set(['.vue', '.ts', '.scss', '.css'])
const FORBIDDEN_STRINGS = [
  'Ready to import',
  'No data imported',
  'No imported profiles',
  'The Social Base',
  'THE SOCIAL BASE',
  'DIFF ACTIVE',
  'SHARED BRAND CONTEXT',
  'Goa Underdog'
]

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await collectFiles(full))
    else if (SRC_EXTS.has(extname(entry.name))) out.push(full)
  }
  return out
}

export async function auditUiHygiene(rootDir = repoRoot) {
  const files = await collectFiles(join(rootDir, 'src'))
  const cssFiles = []
  const forbiddenMatches = []

  for (const file of files) {
    const rel = relative(rootDir, file).replaceAll('\\', '/')
    if (file.endsWith('.css')) cssFiles.push(rel)
    const content = await readFile(file, 'utf8')
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      for (const term of FORBIDDEN_STRINGS) {
        if (lines[i].includes(term)) {
          forbiddenMatches.push({ file: rel, line: i + 1, term })
        }
      }
    }
  }
  return {
    ok: cssFiles.length === 0 && forbiddenMatches.length === 0,
    checkedFiles: files.length,
    cssFiles,
    forbiddenMatches
  }
}

async function main() {
  const report = await auditUiHygiene()
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`UI Hygiene Check (${report.checkedFiles} files in src/):`)
    console.log(`  Plain .css files: ${report.cssFiles.length}`)
    console.log(`  Forbidden telemetry/legacy strings: ${report.forbiddenMatches.length}`)
    for (const f of report.cssFiles) console.error(`  CSS: ${f}`)
    for (const m of report.forbiddenMatches) console.error(`  ${m.file}:${m.line} -> "${m.term}"`)
  }
  if (!report.ok) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(err => {
    console.error('UI hygiene check failed:', err.message)
    process.exitCode = 1
  })
}
