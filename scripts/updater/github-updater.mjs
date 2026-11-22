/**
 * GitHub Auto-Updater Engine (<115 lines)
 * Checks remote GitHub `main` HEAD against local git commit, aborts safely if
 * working tree is dirty, fast-forwards cleanly, and reinstalls deps only when
 * package-lock.json changes.
 */
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_REPO = 'dr-week/SOCIALKILLER'

function runGit(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

export async function checkForGitHubUpdate({
  repo = DEFAULT_REPO,
  branch = 'main',
  cwd = process.cwd(),
  fetchImpl = fetch,
  execGit = runGit
} = {}) {
  let localSha = ''
  try {
    localSha = execGit(['rev-parse', 'HEAD'], cwd)
  } catch {
    return { ok: false, error: 'Not a git checkout; install via install.ps1 or git clone.' }
  }

  try {
    const res = await fetchImpl(`https://api.github.com/repos/${repo}/commits/${branch}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'SOCIALKILLER-Updater/1.0' },
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) return { ok: false, localSha, error: `GitHub API returned HTTP ${res.status}` }
    const data = await res.json()
    const remoteSha = String(data?.sha || '')
    const updateAvailable = Boolean(remoteSha && remoteSha !== localSha)

    return {
      ok: true,
      repo,
      branch,
      localSha: localSha.slice(0, 7),
      remoteSha: remoteSha.slice(0, 7),
      updateAvailable,
      latestMessage: String(data?.commit?.message || '').split('\n')[0]
    }
  } catch (err) {
    return { ok: false, localSha: localSha.slice(0, 7), error: err instanceof Error ? err.message : String(err) }
  }
}

export async function applyGitHubUpdate({
  repo = DEFAULT_REPO,
  branch = 'main',
  cwd = process.cwd(),
  fetchImpl = fetch,
  execGit = runGit,
  installDeps = () => execFileSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd, stdio: 'inherit' })
} = {}) {
  const status = execGit(['status', '--porcelain'], cwd)
  if (status.length > 0) {
    return { ok: false, dirtyWorkingTree: true, error: 'Local uncommitted changes detected. Commit or stash before updating.' }
  }

  const check = await checkForGitHubUpdate({ repo, branch, cwd, fetchImpl, execGit })
  if (!check.ok) return check
  if (!check.updateAvailable) return { ok: true, updated: false, message: `Already up to date (${check.localSha}).` }

  const prevLock = execGit(['rev-parse', 'HEAD:package-lock.json'], cwd)
  execGit(['fetch', 'origin', branch], cwd)
  execGit(['pull', '--ff-only', 'origin', branch], cwd)
  const nextLock = execGit(['rev-parse', 'HEAD:package-lock.json'], cwd)

  let depsReinstalled = false
  if (prevLock !== nextLock) {
    installDeps()
    depsReinstalled = true
  }

  return {
    ok: true,
    updated: true,
    from: check.localSha,
    to: check.remoteSha,
    depsReinstalled,
    message: `Updated ${check.localSha} -> ${check.remoteSha}${depsReinstalled ? ' (dependencies refreshed)' : ''}.`
  }
}

const isDirect = process.argv[1] && resolve(process.argv[1]).toLowerCase() === resolve(fileURLToPath(import.meta.url)).toLowerCase()
if (isDirect) {
  const apply = process.argv.includes('--apply')
  const fn = apply ? applyGitHubUpdate : checkForGitHubUpdate
  fn().then((res) => {
    console.log(JSON.stringify(res, null, 2))
    process.exitCode = res.ok ? 0 : 1
  })
}
