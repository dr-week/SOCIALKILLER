import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const EXT_DIR = path.resolve('extension')

test('all manifest content_scripts and background scripts exist and stay below 150 lines', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(EXT_DIR, 'manifest.json'), 'utf8'))
  const referenced = new Set([manifest.background?.service_worker].filter(Boolean))
  for (const group of manifest.content_scripts || []) {
    for (const file of group.js || []) referenced.add(file)
  }

  assert.ok(referenced.size >= 10, 'Expected at least 10 extension scripts in manifest')
  for (const rel of referenced) {
    const fullPath = path.join(EXT_DIR, rel)
    assert.ok(fs.existsSync(fullPath), `Missing manifest script: ${rel}`)
    const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).length
    assert.ok(lines < 150, `Extension script ${rel} has ${lines} lines (must be < 150)`)
  }
})

test('extension popup routes Instagram launch buttons through focusOrOpenFollowDeskApp (no stale :5173 port)', () => {
  const popupCode = fs.readFileSync(path.join(EXT_DIR, 'popup.js'), 'utf8')
  assert.ok(!popupCode.includes(':5173'), 'popup.js must not hardcode legacy Vite port 5173')
  assert.ok(popupCode.includes("focusOrOpenFollowDeskApp('?app=audience')"))
})

test('content scripts enforce debouncing, hidden-tab guards, TTL caching, and fetch timeouts', () => {
  const mediaCode = fs.readFileSync(path.join(EXT_DIR, 'modules/harvester/media-downloader.js'), 'utf8')
  assert.ok(mediaCode.includes('document.hidden'), 'media-downloader must skip hidden tabs')
  assert.ok(mediaCode.includes('scheduleScan'), 'media-downloader must debounce MutationObserver')
  assert.ok(mediaCode.includes('DOMContentLoaded'), 'media-downloader must guard document.body at document_start')

  const badgeCode = fs.readFileSync(path.join(EXT_DIR, 'modules/harvester/profile-badge.js'), 'utf8')
  assert.ok(badgeCode.includes('statusCache'), 'profile-badge must cache relationship lookups')
  assert.ok(badgeCode.includes('AbortSignal.timeout'), 'profile-badge must bound fetch latency')
  assert.ok(badgeCode.includes('document.hidden'), 'profile-badge must skip hidden tabs')

  const modalCode = fs.readFileSync(path.join(EXT_DIR, 'modules/injections/modal-harvester.js'), 'utf8')
  assert.ok(modalCode.includes('lastBroadcastCount'), 'modal-harvester must only emit IPC when count increases')
  assert.ok(modalCode.includes('document.hidden'), 'modal-harvester must skip hidden tabs')

  const pollerCode = fs.readFileSync(path.join(EXT_DIR, 'modules/background/pending-dispatch-poller.js'), 'utf8')
  assert.ok(pollerCode.includes('AbortSignal.timeout'), 'pending-dispatch-poller must bound fetch calls')
})
