import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeFollowers, compareFollowers, identifyGhostFollowers, normalizeUsername } from '../src/domain/followers.ts'
import { classifyExportFile, parseInstagramExport } from '../src/domain/instagram-export.ts'

test('normalizeUsername handles @ prefixes and casing', () => {
  assert.equal(normalizeUsername('@JaneDoe'), 'janedoe')
  assert.equal(normalizeUsername('  @Cool_User  '), 'cool_user')
  assert.equal(normalizeUsername('ALICE'), 'alice')
})

test('analyzeFollowers calculates notFollowingBack, notFollowedBack, and mutuals', () => {
  const followers = [
    { username: 'alice', href: 'https://instagram.com/alice' },
    { username: 'bob', href: 'https://instagram.com/bob' },
    { username: 'charlie', href: 'https://instagram.com/charlie' }
  ]
  const following = [
    { username: 'bob', href: 'https://instagram.com/bob' },
    { username: 'charlie', href: 'https://instagram.com/charlie' },
    { username: 'david', href: 'https://instagram.com/david' },
    { username: 'eve', href: 'https://instagram.com/eve' }
  ]

  const result = analyzeFollowers(followers, following)

  // david and eve are followed, but do not follow back
  assert.deepEqual(result.notFollowingBack.map(u => u.username), ['david', 'eve'])
  // alice follows, but is not followed back
  assert.deepEqual(result.notFollowedBack.map(u => u.username), ['alice'])
  // bob and charlie are mutuals
  assert.deepEqual(result.mutuals.map(u => u.username), ['bob', 'charlie'])
})

test('compareFollowers calculates new and lost followers accurately against previous snapshot', () => {
  const previous = {
    date: '2026-10-01T00:00:00.000Z',
    followers: [
      { username: 'alice', href: 'https://instagram.com/alice' },
      { username: 'bob', href: 'https://instagram.com/bob' },
      { username: 'charlie', href: 'https://instagram.com/charlie' }
    ],
    following: []
  }

  // bob left, dave joined
  const currentFollowers = [
    { username: 'alice', href: 'https://instagram.com/alice' },
    { username: 'charlie', href: 'https://instagram.com/charlie' },
    { username: 'dave', href: 'https://instagram.com/dave' }
  ]

  const diff = compareFollowers(previous, currentFollowers)
  assert.deepEqual(diff.newFollowers.map(u => u.username), ['dave'])
  assert.deepEqual(diff.lostFollowers.map(u => u.username), ['bob'])
})

test('classifyExportFile identifies followers_N.json and following.json correctly', () => {
  assert.equal(classifyExportFile('followers_1.json'), 'followers')
  assert.equal(classifyExportFile('followers_99.json'), 'followers')
  assert.equal(classifyExportFile('followers.json'), 'followers')
  assert.equal(classifyExportFile('following.json'), 'following')
  assert.equal(classifyExportFile('following_1.json'), 'following')
  assert.equal(classifyExportFile('messages.json'), null)
})

test('parseInstagramExport handles direct arrays and wrapper objects with timestamps', () => {
  const exportFormat = {
    relationships_following: [
      {
        title: 'cool_creator',
        string_list_data: [
          {
            href: 'https://www.instagram.com/cool_creator/',
            value: 'cool_creator',
            timestamp: 1696118400
          }
        ]
      }
    ]
  }

  const parsed = parseInstagramExport(exportFormat)
  assert.equal(parsed.length, 1)
  assert.equal(parsed[0].username, 'cool_creator')
  assert.equal(parsed[0].timestamp, 1696118400)
  assert.equal(parsed[0].href, 'https://www.instagram.com/cool_creator/')
})

test('identifyGhostFollowers finds lurker followers with no mutual engagement', () => {
  const followers = [
    { username: 'ghost_one', href: 'https://instagram.com/ghost_one' },
    { username: 'mutual_friend', href: 'https://instagram.com/mutual_friend' }
  ]
  const following = [
    { username: 'mutual_friend', href: 'https://instagram.com/mutual_friend' },
    { username: 'influencer', href: 'https://instagram.com/influencer' }
  ]

  const ghosts = identifyGhostFollowers(followers, following)
  assert.deepEqual(ghosts.map(g => g.username), ['ghost_one'])
})

test('viral-predictor accurately evaluates hook strength and viral potential', async () => {
  const { evaluateHook, predictViralReach } = await import('../src/domain/analytics/viral-predictor.ts')
  
  const strongHook = "Stop making this rookie mistake with your brand design."
  const result1 = evaluateHook(strongHook)
  assert.ok(result1.score >= 70, 'Contrarian opening must yield high hook score')
  assert.ok(result1.strengths.some(s => s.includes('contrarian')), 'Must detect contrarian trigger')

  const viralCaption = "Stop making this mistake. Here is the 5-step breakdown workflow to scale your setup.\nSave this guide before you start."
  const prediction = predictViralReach(viralCaption)
  assert.ok(prediction.overallScore >= 75, 'Actionable value-dense copy with Save CTA must score high')
  assert.equal(prediction.sentimentTone, 'Contrarian / Curious')
})

test('followers engine processes 50,000+ follower records within high-performance time bound', () => {
  const count = 50000
  const followers = []
  const following = []

  for (let i = 0; i < count; i++) {
    followers.push({ username: `user_${i}`, href: `https://instagram.com/user_${i}` })
    // Half mutual, half not
    if (i % 2 === 0) {
      following.push({ username: `user_${i}`, href: `https://instagram.com/user_${i}` })
    }
  }

  const startTime = performance.now()
  const result = analyzeFollowers(followers, following)
  const duration = performance.now() - startTime

  assert.equal(result.mutuals.length, 25000)
  assert.equal(result.notFollowedBack.length, 25000)
  assert.equal(result.notFollowingBack.length, 0)
  assert.ok(duration < 250, `50,000 records processed in ${duration.toFixed(2)}ms (must be < 250ms)`)
})


