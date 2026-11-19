import { initializeSocialSchema } from './schema-social.mjs'
import { initializeWorkspaceSchema } from './schema-workspaces.mjs'
import { initializeAutomationSchema } from './schema-automation.mjs'
import { initializeAgencyCrmSchema } from './schema-agency-crm.mjs'
import { initializeVisualBotSchema } from './schema-visual-bot.mjs'

export function initializeSchema(db) {
  initializeSocialSchema(db)
  initializeWorkspaceSchema(db)
  initializeAutomationSchema(db)
  initializeAgencyCrmSchema(db)
  initializeVisualBotSchema(db)
}
