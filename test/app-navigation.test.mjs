import assert from 'node:assert/strict'
import test from 'node:test'
import { appHref, viewFromSearch } from '../src/features/app-shell/app-navigation.ts'
import { rankFuzzyItems, scoreFuzzyMatch } from '../src/shared/search/fuzzy-search.ts'

test('opens the launcher by default and maps app IDs to the same site', () => {
  assert.equal(viewFromSearch(''), 'app-launcher')
  assert.equal(viewFromSearch('?app=connections'), 'connections')
  assert.equal(viewFromSearch('?app=workflows'), 'workflows')
  assert.equal(viewFromSearch('?app=script-studio'), 'script-studio')
  assert.equal(viewFromSearch('?app=design-system'), 'design-system')
  assert.equal(viewFromSearch('?app=asset-manager'), 'asset-manager')
  assert.equal(viewFromSearch('?app=automations'), 'automation-studio')
  assert.equal(viewFromSearch('?app=android-builder'), 'android-studio')
  assert.equal(viewFromSearch('?app=leads'), 'leads')
  assert.equal(appHref('connections', 'https://local.test/workspace?keep=1#top'), '/workspace?keep=1&app=connections#top')
  assert.equal(appHref('workflows', 'https://local.test/workspace'), '/workspace?app=workflows')
  assert.equal(appHref('design-system', 'https://local.test/workspace'), '/workspace?app=design-system')
  assert.equal(appHref('asset-manager', 'https://local.test/workspace'), '/workspace?app=asset-manager')
  assert.equal(appHref('automation-studio', 'https://local.test/workspace'), '/workspace?app=automations')
  assert.equal(appHref('android-studio', 'https://local.test/workspace'), '/workspace?app=android-builder')
  assert.equal(appHref('leads', 'https://local.test/workspace'), '/workspace?app=leads')
})

test('keeps audience subviews addressable within the Audience Audit app', () => {
  const href = appHref('followers', 'https://local.test/')
  assert.equal(href, '/?app=audience&view=followers')
  assert.equal(viewFromSearch(new URL(href, 'https://local.test').search), 'followers')
})

test('rejects unknown mini-app and audience routes to safe defaults', () => {
  assert.equal(viewFromSearch('?app=missing'), 'app-launcher')
  assert.equal(viewFromSearch('?app=audience&view=social-publisher'), 'overview')
})

test('fuzzy search ranks prefix, word-boundary, and ordered subsequence matches', () => {
  const apps = [
    { id: 'audience', label: 'Audience Audit', category: 'Audience', description: 'Followers and non-reciprocal insights' },
    { id: 'workflows', label: 'Workflows', category: 'Operate', description: 'Visual Bot locator and human cadence' },
    { id: 'planner', label: 'Planner', category: 'Publish', description: 'Compose and schedule variants' }
  ]
  const audMatches = rankFuzzyItems(apps, 'aud', a => [a.label, a.category, a.description])
  const typoMatches = rankFuzzyItems(apps, 'audence', a => [a.label, a.category, a.description])
  const wrkMatches = rankFuzzyItems(apps, 'wrk', a => [a.label, a.category, a.description])
  const noMatches = rankFuzzyItems(apps, 'zzzzqqq', a => [a.label, a.category, a.description])
  assert.equal(audMatches[0]?.id, 'audience')
  assert.equal(typoMatches[0]?.id, 'audience')
  assert.equal(wrkMatches[0]?.id, 'workflows')
  assert.equal(noMatches.length, 0)
  assert.ok(scoreFuzzyMatch('plan', 'Planner') > scoreFuzzyMatch('pln', 'Planner'))
})
