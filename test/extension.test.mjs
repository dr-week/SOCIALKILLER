import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { computeHumanJitterMs, buildContextualChatReplies } from '../extension/modules/human-cadence.js'
import { PLATFORM_SESSION_RULES } from '../extension/modules/account-recognizer.js'
import { ADAPTIVE_PLATFORM_THEMES } from '../extension/modules/page-harvester.js'

test('extension manifest is valid Manifest V3 structure with multi-platform permissions', () => {
  const manifestPath = path.resolve('extension/manifest.json')
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.manifest_version, 3, 'manifest_version must be 3')
  assert.ok(manifest.permissions.includes('cookies'), 'must request cookies permission')
  assert.ok(manifest.permissions.includes('scripting'), 'must request scripting permission')
  assert.ok(manifest.permissions.includes('alarms'), 'must request alarms permission for keep-alive & queue')
  assert.ok(manifest.permissions.includes('contextMenus'), 'must request contextMenus permission')
  assert.ok(manifest.host_permissions.some(p => p.includes('x.com')), 'must support x.com auto-posting')
  assert.ok(manifest.host_permissions.some(p => p.includes('reddit.com')), 'must support reddit.com auto-posting')
  assert.ok(manifest.host_permissions.some(p => p.includes('dev.to')), 'must support dev.to blog auto-posting')
  assert.ok(manifest.host_permissions.some(p => p.includes('127.0.0.1')), 'must support 127.0.0.1 bridge')
})

test('extension icon files exist and are non-empty', () => {
  const iconSizes = ['16', '48', '128']
  for (const size of iconSizes) {
    const iconFile = path.resolve(`extension/icons/icon-${size}.png`)
    assert.ok(fs.existsSync(iconFile), `icon-${size}.png must exist`)
    const stat = fs.statSync(iconFile)
    assert.ok(stat.size > 0, `icon-${size}.png must have valid non-zero size`)
  }
})

test('extension entry points and modules exist and are non-empty', () => {
  const files = [
    'extension/background.js',
    'extension/modules/background/app-lifecycle.js',
    'extension/modules/background/constants.js',
    'extension/modules/background/constants.js',
    'extension/modules/background/context-menu.js',
    'extension/modules/background/extension-logger.js',
    'extension/modules/background/keep-alive-alarm.js',
    'extension/modules/background/pending-dispatch-poller.js',
    'extension/modules/background/platform-dispatch.js',
    'extension/modules/background/platform-urls.js',
    'extension/modules/background/messages/active-brand.js',
    'extension/modules/background/messages/dispatch-posts.js',
    'extension/modules/background/messages/disabled-hybrid.js',
    'extension/modules/background/messages/disabled-hybrid.js',
    'extension/modules/background/messages/fill-active-tab.js',
    'extension/modules/background/messages/mark-posted.js',
    'extension/modules/background/messages/pending-autopost.js',
    'extension/modules/background/messages/register-message-router.js',
    'extension/popup.html',
    'extension/popup.js',
    'extension/extractor.js',
    'extension/modules/popup-scanner.js',
    'extension/modules/popup-publisher.js',
    'extension/modules/popup-accounts-chat.js',
    'extension/modules/account-recognizer.js',
    'extension/modules/human-cadence.js',
    'extension/modules/page-harvester.js',
    'extension/modules/tab-service.js',
    'extension/modules/cookie-service.js',
    'extension/modules/sync-service.js',
    'extension/modules/media-downloader.js',
    'extension/modules/ghost-mode.js',
    'extension/modules/profile-badge.js',
    'extension/modules/injections/app-bridge.js',
    'extension/modules/injections/dom-chat-banner.js',
    'extension/modules/injections/search-injector.js',
    'extension/modules/injections/whitelist-injector.js',
    'extension/modules/injections/creator-hud-injector.js',
    'extension/modules/injections/modal-harvester.js',
    'extension/modules/injections/social-autoposter.js',
    'extension/modules/fiber/react-fiber-bridge.js',
    'extension/modules/fiber/network-interceptor.js',
    'extension/modules/extractor-identity.js',
    'extension/modules/extractor-checkpoint.js',
    'extension/modules/popup-theme.js',
    'extension/modules/app-launcher.js',
    'extension/modules/auto-poster.js'
  ]
  for (const file of files) {
    const filePath = path.resolve(file)
    assert.ok(fs.existsSync(filePath), `${file} must exist`)
    const content = fs.readFileSync(filePath, 'utf8')
    assert.ok(content.length > 50, `${file} must not be empty`)
  }
})

test('human-cadence, account-recognizer, and page-harvester modules generate valid adaptive themes, jitter, and session rules', () => {
  const jitter = computeHumanJitterMs(150, 50)
  assert.ok(jitter >= 45 && jitter <= 450, 'Jitter must stay within bounded human cognitive window')

  const replies = buildContextualChatReplies('Rust WebAssembly DOM performance', 'reddit')
  assert.equal(replies.length, 4)
  assert.ok(replies[0].text.includes('fast-framework'))

  assert.ok(PLATFORM_SESSION_RULES.length >= 7)
  assert.ok(PLATFORM_SESSION_RULES.some(r => r.id === 'github' && r.cookies.includes('dotcom_user')))
  assert.ok(ADAPTIVE_PLATFORM_THEMES.x && ADAPTIVE_PLATFORM_THEMES.reddit && ADAPTIVE_PLATFORM_THEMES.github)
})

test('harvester simulation verifies link normalization, deduplication, and reserved filtering', () => {
  const rawSampleHrefs = [
    '/alex_creator/',
    '/explore/',
    '/stories/alex_creator/',
    '/sarah_travels/',
    '/reels/',
    '/ALEX_CREATOR/',
    '/techcrunch/'
  ]

  const harvestedUsers = new Map()
  const reserved = new Set(['explore', 'reels', 'stories', 'direct', 'p', 'accounts', 'developer'])

  for (const href of rawSampleHrefs) {
    const parts = href.replace(/^\/+|\/+$/g, '').split('/')
    if (parts.length === 1) {
      const cleanUser = parts[0].toLowerCase()
      if (!reserved.has(cleanUser) && cleanUser.length > 0) {
        if (!harvestedUsers.has(cleanUser)) {
          harvestedUsers.set(cleanUser, {
            username: parts[0],
            href: `https://www.instagram.com/${encodeURIComponent(parts[0])}/`
          })
        }
      }
    }
  }

  assert.equal(harvestedUsers.size, 3)
  assert.ok(harvestedUsers.has('alex_creator'))
  assert.ok(harvestedUsers.has('sarah_travels'))
  assert.ok(harvestedUsers.has('techcrunch'))
})
