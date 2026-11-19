import { createPublishingStatements } from './statements/publishing-statements.mjs'
import { createWorkspaceStatements } from './statements/workspace-statements.mjs'

export function createDbStatements(db) {
  return {
    ...createPublishingStatements(db),
    ...createWorkspaceStatements(db)
  }
}
