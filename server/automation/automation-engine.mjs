import { randomUUID } from 'node:crypto'
import { conditionsMatch } from './automation-definition.mjs'

export function createAutomationEngine(repository, executeAction, now = () => new Date()) {
  async function run(rule, input, triggerId, retryRun = null) {
    const startedAt = now().toISOString()
    const run = retryRun || repository.beginRun({
      id: randomUUID(), ruleId: rule.id, brandId: rule.brandId,
      triggerId, input, startedAt
    })
    if (run.status !== 'running' && !retryRun) return run
    const actionResults = retryRun?.actionResults || run.actionResults || []
    repository.updateRun({ ...run, status: 'running', actionResults, error: null, startedAt, completedAt: null })
    const matched = conditionsMatch(rule.conditions, input)
    const branch = matched ? 'matched' : 'unmatched'
    const actions = matched ? rule.actions : rule.elseActions
    if (!actions.length) {
      return repository.updateRun({ ...run, status: 'skipped', actionResults, error: null, startedAt, completedAt: now().toISOString() })
    }
    try {
      const completed = actionResults.filter(item => item.branch === branch).length
      for (let index = completed; index < actions.length; index++) {
        const result = await executeAction(actions[index], {
          brandId: rule.brandId, ruleId: rule.id, triggerId, actionIndex: index
        })
        if (!result || (result.id == null && result.status !== 'skipped_duplicate_token')) {
          throw new Error(result?.message || result?.error || 'The action did not create a draft.')
        }
        actionResults.push({ branch, index, result })
        repository.updateRun({ ...run, status: 'running', actionResults, error: null, startedAt, completedAt: null })
      }
      return repository.updateRun({ ...run, status: 'succeeded', actionResults, error: null, startedAt, completedAt: now().toISOString() })
    } catch (error) {
      return repository.updateRun({ ...run, status: 'failed', actionResults, error: error.message, startedAt, completedAt: now().toISOString() })
    }
  }

  return {
    run,
    retry(runRecord, rule) {
      if (runRecord.status !== 'failed') throw new Error('Only failed automation runs can be retried.')
      return run(rule, runRecord.input, runRecord.triggerId, runRecord)
    }
  }
}
