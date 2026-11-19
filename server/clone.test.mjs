import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import { savePageCloneSession, listPageCloneSessions, getHtmlClone } from './clone-service.mjs'

test('clone-service saves and retrieves session clones correctly', () => {
  const sampleData = {
    url: 'https://www.instagram.com/sidequest_ceo/',
    title: 'Sidequest CEO on Instagram',
    username: 'sidequest_ceo',
    html: '<!DOCTYPE html><html><body><h1>Sample Profile Clone</h1></body></html>',
    metadata: { scrollPosition: { x: 0, y: 120 } }
  }

  const result = savePageCloneSession(sampleData)
  assert.ok(result.sessionId.includes('sidequest_ceo'), 'Session ID must include username')
  assert.ok(fs.existsSync(result.sessionPath), 'Metadata session JSON file must exist')
  assert.ok(fs.existsSync(result.htmlPath), 'HTML clone file must exist')

  const sessions = listPageCloneSessions()
  assert.ok(sessions.some(s => s.sessionId === result.sessionId), 'Session list must contain newly created session')

  const html = getHtmlClone(result.sessionId)
  assert.ok(html && html.includes('Sample Profile Clone'), 'Retrieved HTML clone must match written content')

  // Cleanup test files
  try {
    fs.unlinkSync(result.sessionPath)
    fs.unlinkSync(result.htmlPath)
  } catch {}
})
