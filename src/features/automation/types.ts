export type AutomationTrigger = 'manual' | 'schedule' | 'social.post.created'
export type AutomationConditionField = 'event.source' | 'event.status' | 'event.platformId' | 'event.title'

export interface AutomationCondition {
  field: AutomationConditionField
  operator: 'equals' | 'contains'
  value: string
}

export interface AutomationAction {
  type: 'create_social_draft'
  topic: string
  notes: string
  platformIds: string[]
}

export interface AutomationRule {
  id: string
  brandId: string
  name: string
  triggerType: AutomationTrigger
  triggerConfig: { intervalMinutes?: number }
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  elseActions: AutomationAction[]
  enabled: boolean
  lastRunAt: string | null
}

export interface AutomationRun {
  id: string
  ruleId: string
  status: 'running' | 'succeeded' | 'skipped' | 'failed'
  error: string | null
  actionResults: Array<{ branch: string; index: number; result: { id?: string; title?: string } }>
  startedAt: string
}
