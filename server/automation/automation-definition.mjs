const TRIGGERS = new Set(['manual', 'schedule', 'social.post.created'])
const CONDITION_FIELDS = new Set(['event.source', 'event.status', 'event.platformId', 'event.title'])
const PLATFORM_IDS = new Set(['instagram', 'x', 'linkedin', 'reddit', 'github', 'discord', 'devto', 'hashnode', 'medium', 'ai_registry'])

export class AutomationValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AutomationValidationError'
  }
}

function boundedText(value, field, maximum, required = false) {
  if (typeof value !== 'string') throw new AutomationValidationError(`${field} must be text.`)
  const text = value.trim()
  if ((required && !text) || text.length > maximum) throw new AutomationValidationError(`${field} is required and must be at most ${maximum} characters.`)
  return text
}

export function normalizeAutomationDefinition(input, brandId, id, enabled = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AutomationValidationError('Automation definition must be an object.')
  const name = boundedText(input.name, 'name', 80, true)
  const triggerType = input.triggerType
  if (!TRIGGERS.has(triggerType)) throw new AutomationValidationError('Unsupported automation trigger.')
  const triggerConfig = triggerType === 'schedule' ? input.triggerConfig || {} : {}
  if (triggerType === 'schedule' && (!Number.isInteger(triggerConfig.intervalMinutes) || triggerConfig.intervalMinutes < 15 || triggerConfig.intervalMinutes > 10080)) {
    throw new AutomationValidationError('Scheduled workflows must run every 15 minutes to 7 days.')
  }
  const conditions = input.conditions || []
  if (!Array.isArray(conditions) || conditions.length > 5) throw new AutomationValidationError('Provide at most five conditions.')
  for (const condition of conditions) {
    if (!condition || typeof condition !== 'object' || Array.isArray(condition)) throw new AutomationValidationError('Each condition must be an object.')
    if (!CONDITION_FIELDS.has(condition.field) || !['equals', 'contains'].includes(condition.operator)) {
      throw new AutomationValidationError('A condition uses an unsupported field or operator.')
    }
    boundedText(condition.value, 'condition value', 120, true)
  }
  const normalizeActions = (actions, branch) => {
    if (!Array.isArray(actions) || actions.length > 5) throw new AutomationValidationError(`${branch} branch can contain at most five actions.`)
    for (const action of actions) {
      if (!action || typeof action !== 'object' || Array.isArray(action)) throw new AutomationValidationError('Each action must be an object.')
      if (action.type !== 'create_social_draft') throw new AutomationValidationError('Only draft-creation actions are currently available.')
      boundedText(action.topic, 'action topic', 160, true)
      boundedText(action.notes || '', 'action notes', 3000)
      if (!Array.isArray(action.platformIds) || action.platformIds.length < 1 || action.platformIds.length > 5
        || action.platformIds.some(platform => !PLATFORM_IDS.has(platform))) {
        throw new AutomationValidationError('Select one to five supported social channels.')
      }
    }
    return actions
  }
  const actions = normalizeActions(input.actions, 'Matched')
  const elseActions = normalizeActions(input.elseActions || [], 'Unmatched')
  if (!actions.length && !elseActions.length) throw new AutomationValidationError('Add at least one action to either condition branch.')
  return { id, brandId, name, triggerType, triggerConfig, conditions, actions, elseActions, enabled }
}

export function conditionsMatch(conditions, event) {
  return conditions.every(condition => {
    const field = condition.field.slice('event.'.length)
    const actual = event[field]
    if (typeof actual !== 'string') return false
    return condition.operator === 'equals'
      ? actual.toLocaleLowerCase() === condition.value.toLocaleLowerCase()
      : actual.toLocaleLowerCase().includes(condition.value.toLocaleLowerCase())
  })
}
