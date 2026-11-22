import assert from 'node:assert/strict'
import test from 'node:test'
import { applyCopyFramework, COPY_FRAMEWORKS } from '../src/domain/copy-frameworks.ts'
import { classifyInboxIntent } from '../src/domain/inbox-intent.ts'
import { evaluateSafetyBudget } from '../src/domain/safety-budget.ts'

test('applyCopyFramework formats all 4 composer frameworks cleanly', () => {
  assert.equal(COPY_FRAMEWORKS.length, 4)
  const hso = applyCopyFramework('hook_story_offer', 'Danger Labs', 'Zero-VDOM', 'Built a 2.5KB runtime.')
  assert.ok(hso.notes.includes('HOOK:') && hso.notes.includes('STORY:') && hso.notes.includes('OFFER:'))

  const carousel = applyCopyFramework('edu_carousel', 'Danger Labs', 'QUBO', 'Sub-3ms slot solver.')
  assert.ok(carousel.topic.startsWith('5-Step Guide:'))
  assert.ok(carousel.notes.includes('Slide 5 (CTA):'))

  const punchy = applyCopyFramework('short_punchy', 'Danger Labs', 'Fast', 'Zero bloat. Runs local.')
  assert.ok(punchy.notes.includes('Details in thread.'))

  const promo = applyCopyFramework('event_promo', 'Danger Labs', 'v2 Launch', 'Live on GitHub Pages.')
  assert.ok(promo.topic.startsWith('Launching:'))
})

test('classifyInboxIntent accurately categorizes Hot Lead, Complaint, Praise, Inquiry, and General', () => {
  assert.equal(classifyInboxIntent('What is your enterprise pricing for 10 seats?').intent, 'hot_lead')
  assert.equal(classifyInboxIntent('The app is broken and keeps crashing!').intent, 'complaint')
  assert.equal(classifyInboxIntent('Love this tool, so clean and fast!').intent, 'praise')
  assert.equal(classifyInboxIntent('How do I link my GitHub repo?').intent, 'inquiry')
  assert.equal(classifyInboxIntent('Hello from Goa.').intent, 'general')
})

test('evaluateSafetyBudget escalates pacing preset and triggers cooldown at limits', () => {
  assert.equal(evaluateSafetyBudget(1, 3).tier, 'safe')
  assert.equal(evaluateSafetyBudget(10, 20).tier, 'caution')
  assert.equal(evaluateSafetyBudget(10, 20).recommendedPreset, 'ultra')
  assert.equal(evaluateSafetyBudget(15, 25).cooldownActive, true)
  assert.equal(evaluateSafetyBudget(15, 25).tier, 'cooldown')
})
