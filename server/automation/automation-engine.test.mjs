import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { createAutomationEngine } from './automation-engine.mjs'
import { normalizeAutomationDefinition } from './automation-definition.mjs'
import { createAutomationRepository } from './automation-repository.mjs'
import { initializeAutomationSchema } from '../db/schema-automation.mjs'

function setup() {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  initializeAutomationSchema(db)
  const repository = createAutomationRepository(db)
  return { db, repository }
}

const ruleInput = {
  name: 'Draft a follow-up',
  triggerType: 'social.post.created',
  conditions: [{ field: 'event.platformId', operator: 'equals', value: 'x' }],
  actions: [
    { type: 'create_social_draft', topic: 'Follow-up one', notes: 'First step', platformIds: ['x'] },
    { type: 'create_social_draft', topic: 'Follow-up two', notes: 'Second step', platformIds: ['linkedin'] }
  ]
}

test('automation validates triggers, branches, and draft-only actions', () => {
  assert.throws(() => normalizeAutomationDefinition({ ...ruleInput, triggerType: 'email.sent' }, 'brand', 'rule'), /trigger/)
  assert.throws(() => normalizeAutomationDefinition({ ...ruleInput, actions: [{ type: 'send_email' }] }, 'brand', 'rule'), /draft-creation/)
  assert.throws(() => normalizeAutomationDefinition({ ...ruleInput, triggerType: 'schedule', triggerConfig: { intervalMinutes: 1 } }, 'brand', 'rule'), /15 minutes/)
})

test('automation persists multi-step results, skips non-matching branches, and deduplicates events', async () => {
  const { db, repository } = setup()
  try {
    const rule = repository.saveRule(normalizeAutomationDefinition(ruleInput, 'brand-a', 'rule-a', true))
    let actions = 0
    const engine = createAutomationEngine(repository, async () => ({ id: `draft-${++actions}`, status: 'draft' }))
    const skipped = await engine.run(rule, { platformId: 'linkedin' }, 'event-skip')
    assert.equal(skipped.status, 'skipped')
    const result = await engine.run(rule, { platformId: 'x' }, 'event-one')
    assert.equal(result.status, 'succeeded')
    assert.equal(result.actionResults.length, 2)
    assert.equal((await engine.run(rule, { platformId: 'x' }, 'event-one')).id, result.id)
    assert.equal(actions, 2)
    assert.equal(repository.getRuns('brand-a').length, 2)
    assert.equal(repository.getRuns('brand-b').length, 0)
  } finally { db.close() }
})

test('retry resumes at the failed step without repeating completed actions', async () => {
  const { db, repository } = setup()
  try {
    const rule = repository.saveRule(normalizeAutomationDefinition(ruleInput, 'brand-a', 'rule-b', true))
    let firstStepCalls = 0
    let secondStepCalls = 0
    const engine = createAutomationEngine(repository, async (_action, context) => {
      if (context.actionIndex === 0) firstStepCalls++
      if (context.actionIndex === 1 && secondStepCalls++ === 0) throw new Error('Temporary action failure')
      return { id: `draft-${context.actionIndex}`, status: 'draft' }
    })
    const failed = await engine.run(rule, { platformId: 'x' }, 'event-retry')
    assert.equal(failed.status, 'failed')
    assert.equal(failed.actionResults.length, 1)
    const retried = await engine.retry(failed, rule)
    assert.equal(retried.status, 'succeeded')
    assert.equal(firstStepCalls, 1)
    assert.equal(secondStepCalls, 2)
  } finally { db.close() }
})

test('automation executes the alternate branch when conditions do not match', async () => {
  const { db, repository } = setup()
  try {
    const definition = normalizeAutomationDefinition({
      ...ruleInput,
      elseActions: [{ type: 'create_social_draft', topic: 'Alternate path', platformIds: ['reddit'] }]
    }, 'brand-a', 'rule-c', true)
    const rule = repository.saveRule(definition)
    const engine = createAutomationEngine(repository, async action => ({ id: action.topic, status: 'draft' }))
    const result = await engine.run(rule, { platformId: 'linkedin' }, 'event-else')
    assert.equal(result.status, 'succeeded')
    assert.equal(result.actionResults[0].branch, 'unmatched')
    assert.equal(result.actionResults[0].result.id, 'Alternate path')
  } finally { db.close() }
})
