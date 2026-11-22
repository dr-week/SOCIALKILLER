import assert from 'node:assert/strict'
import test from 'node:test'
import { applyGitHubUpdate, checkForGitHubUpdate } from './github-updater.mjs'

test('checkForGitHubUpdate detects newer remote SHA cleanly', async () => {
  const mockGit = () => 'aaaaaaa1111111'
  const mockFetch = async () => new Response(JSON.stringify({
    sha: 'bbbbbbb2222222',
    commit: { message: 'feat: faster visual bot\ndetails' }
  }), { status: 200 })

  const res = await checkForGitHubUpdate({ execGit: mockGit, fetchImpl: mockFetch })
  assert.equal(res.ok, true)
  assert.equal(res.updateAvailable, true)
  assert.equal(res.localSha, 'aaaaaaa')
  assert.equal(res.remoteSha, 'bbbbbbb')
  assert.equal(res.latestMessage, 'feat: faster visual bot')
})

test('applyGitHubUpdate aborts safely when working tree is dirty', async () => {
  const mockGit = (args) => (args[0] === 'status' ? ' M README.md' : 'aaaaaaa')
  const res = await applyGitHubUpdate({ execGit: mockGit })
  assert.equal(res.ok, false)
  assert.equal(res.dirtyWorkingTree, true)
})

test('applyGitHubUpdate fast-forwards and reinstalls deps only when package-lock.json changes', async () => {
  let lockCalls = 0
  let installed = false
  const calls = []
  const mockGit = (args) => {
    calls.push(args.join(' '))
    if (args[0] === 'status') return ''
    if (args[1] === 'HEAD') return 'aaaaaaa1111111'
    if (args[1] === 'HEAD:package-lock.json') return ++lockCalls === 1 ? 'lock_v1' : 'lock_v2'
    return ''
  }
  const mockFetch = async () => new Response(JSON.stringify({
    sha: 'bbbbbbb2222222',
    commit: { message: 'chore: update deps' }
  }), { status: 200 })

  const res = await applyGitHubUpdate({
    execGit: mockGit,
    fetchImpl: mockFetch,
    installDeps: () => { installed = true }
  })

  assert.equal(res.ok, true)
  assert.equal(res.updated, true)
  assert.equal(res.depsReinstalled, true)
  assert.equal(installed, true)
  assert.ok(calls.includes('pull --ff-only origin main'))
})
