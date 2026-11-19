import { readdir, readFile } from 'node:fs/promises'
import { resolve, relative, extname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const sourceRoots = ['src', 'server', 'extension', 'scripts', 'test', 'launcher', 'android', 'src-tauri']
const rootFiles = ['server.mjs', 'auto-launch.mjs', 'vite.config.ts', 'capacitor.config.ts']
const sourceExtensions = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.rs',
  '.css', '.scss', '.ps1', '.bat', '.cmd', '.sh', '.html', '.java', '.kt'
])
const ignoredDirectories = new Set(['node_modules', 'dist', '.data', '.git', 'build', 'coverage', 'capacitor-cordova-android-plugins'])
const generatedPaths = new Set(['android/app/src/main/assets/public'])
const maxLines = 149

export function evaluateFileSize(_file, lineCount, _baseline = {}, limit = maxLines) {
  return { ok: lineCount <= limit, legacy: false }
}

export function largestFiles(files, count) {
  return [...files]
    .sort((left, right) => right.lines - left.lines || left.file.localeCompare(right.file))
    .slice(0, count)
}

export async function collectSourceFiles(directory, base = root) {
  const files = []
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return files
    throw error
  }
  for (const entry of entries) {
    const fullPath = join(directory, entry.name)
    const relativePath = relative(base, fullPath).replaceAll('\\', '/')
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name) && !generatedPaths.has(relativePath)) {
      files.push(...await collectSourceFiles(fullPath, base))
    }
    else if (sourceExtensions.has(extname(entry.name))) files.push(fullPath)
  }
  return files
}

export async function collectProjectSourceFiles(projectRoot = root) {
  const files = await Promise.all(sourceRoots.map(name =>
    collectSourceFiles(join(projectRoot, name), projectRoot)
  ))
  return [...files.flat(), ...rootFiles.map(name => join(projectRoot, name))]
}

function countLines(source) {
  const trimmed = source.trimEnd()
  return trimmed ? trimmed.split(/\r?\n/).length : 0
}

async function main() {
  const topOption = process.argv.find(argument => argument.startsWith('--top='))
  const topCount = topOption ? Number(topOption.slice('--top='.length)) : 0
  if (topOption && (!Number.isInteger(topCount) || topCount < 1 || topCount > 50)) {
    throw new Error('--top must be an integer from 1 to 50')
  }
  const paths = await collectProjectSourceFiles(root)
  const failures = []
  const oversizedFiles = []

  for (const fullPath of paths) {
    const file = relative(root, fullPath).replaceAll('\\', '/')
    const lines = countLines(await readFile(fullPath, 'utf8'))
    const result = evaluateFileSize(file, lines)
    if (!result.ok) {
      oversizedFiles.push({ file, lines })
      failures.push(`FAIL ${file}: ${lines} lines (hard limit ${maxLines})`)
    }
  }

  if (failures.length) {
    console.error(failures.join('\n'))
    console.error(`\n${failures.length} file-size violation(s). All source files must stay below 150 lines; baseline exceptions do not apply.`)
    process.exitCode = 1
    if (topCount || process.argv.includes('--verbose')) {
      console.error(`Largest oversized files:\n${largestFiles(oversizedFiles, topCount || 15).map(({ file, lines }) =>
        `OVER ${file}: ${lines}/${maxLines} lines`).join('\n')}`)
    }
    return
  }

  console.log(`File-size check passed: ${paths.length} files scanned; every file is below 150 lines.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('File-size check failed:', error.message)
    process.exitCode = 1
  })
}
