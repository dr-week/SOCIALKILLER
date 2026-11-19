import { initializeSocialSchema } from './schema-social.mjs'
import { initializeWorkspaceSchema } from './schema-workspaces.mjs'
import { initializeAutomationSchema } from './schema-automation.mjs'

export function initializeSchema(db) {
  initializeSocialSchema(db)
  initializeWorkspaceSchema(db)
  initializeAutomationSchema(db)
}
