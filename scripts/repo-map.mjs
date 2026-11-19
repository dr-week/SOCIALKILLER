import { readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const departments = [
  ['src', 'Frontend app, features, and domain'],
  ['server', 'Local API, business modules, persistence, and adapters'],
  ['extension', 'Browser companion'],
  ['scripts', 'Development and maintenance automation'],
  ['test', 'Shared domain and workflow tests'],
  ['launcher', 'Local process lifecycle'],
  ['android/app/src/main/java', 'Capacitor Android native code']
]
const ignored = new Set(['node_modules', 'dist', '.data', '.git', 'build', 'coverage', '.gradle'])
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.rs', '.css', '.scss', '.html', '.java', '.kt'])

async function scanDirectory(base, folder, depth, maxDepth, listFiles) {
  const entries = await readdir(folder, { withFileTypes: true })
  const files = entries
    .filter(entry => entry.isFile() && codeExtensions.has(entry.name.slice(entry.name.lastIndexOf('.'))))
    .map(entry => entry.name).sort()
  const node = {
    path: relative(base, folder).replaceAll('\\', '/'),
    files,
    children: []
  }
  if (depth < maxDepth) {
    const children = entries.filter(entry => entry.isDirectory() && !ignored.has(entry.name)).sort((a, b) => a.name.localeCompare(b.name))
    node.children = await Promise.all(children.map(entry =>
      scanDirectory(base, join(folder, entry.name), depth + 1, maxDepth, listFiles)
    ))
  }
  if (!listFiles) node.files = files.length
  return node
}

export async function buildRepoMap(projectRoot, { depth = 2, listFiles = false } = {}) {
  const rootPath = resolve(projectRoot)
  const result = []
  for (const [path, purpose] of departments) {
    try {
      result.push({ purpose, ...(await scanDirectory(rootPath, join(rootPath, path), 0, depth, listFiles)) })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return result
}

function renderNode(node, listFiles, indent = '') {
  const count = Array.isArray(node.files) ? node.files.length : node.files
  const detail = listFiles && count ? `: ${node.files.join(', ')}` : ''
  return [
    `${indent}${node.path}/ (${count} direct code files)${detail}`,
    ...node.children.flatMap(child => renderNode(child, listFiles, `${indent}  `))
  ]
}

export function formatRepoMap(departmentsMap, listFiles = false) {
  const lines = ['The Social Base source map (directory depth 2; code files only)']
  for (const department of departmentsMap) {
    lines.push(`\n${department.path}/ — ${department.purpose}`)
    lines.push(...renderNode(department, listFiles, '  '))
  }
  return lines.join('\n')
}

async function main() {
  const listFiles = process.argv.includes('--files')
  const map = await buildRepoMap(root, { listFiles })
  console.log(formatRepoMap(map, listFiles))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error('Repository map failed:', error.message)
    process.exitCode = 1
  })
}
