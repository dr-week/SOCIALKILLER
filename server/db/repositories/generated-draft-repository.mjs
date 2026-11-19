export function createGeneratedDraftRepository(statements) {
  const { insertGeneratedDraftStmt, hasGeneratedDraftStmt, getGeneratedDraftTopicsStmt, generatedDraftFeedbackStatsStmt, setGeneratedDraftFeedbackStmt, saveInteractionWorkflowStmt, getInteractionWorkflowsStmt, deleteInteractionWorkflowStmt } = statements
  return {
  saveGeneratedDraft(draft) {
    const row = { ...draft, createdAt: draft.createdAt || new Date().toISOString() }
    const result = insertGeneratedDraftStmt.run(row.id, row.brandId, row.platformId, row.topicKey, row.sourceKey || '', row.contentHash, row.topic, row.content, row.source, row.sourceUrl || '', row.context, row.templateId, row.createdAt)
    return result.changes > 0 ? row : null
  },

  hasGeneratedDraft({ brandId, platformId, topicKey, sourceKey = '', contentHash }) {
    return Boolean(hasGeneratedDraftStmt.get(brandId, platformId, topicKey, sourceKey, sourceKey, contentHash))
  },

  getGeneratedDraftTopics(brandId, platformId) {
    return getGeneratedDraftTopicsStmt.all(brandId, platformId).map(row => row.topic)
  },

  getGeneratedDraftFeedbackStats(brandId, platformId) {
    return generatedDraftFeedbackStatsStmt.all(brandId, platformId).map(row => ({
      templateId: row.templateId,
      likes: Number(row.likes) || 0,
      dislikes: Number(row.dislikes) || 0
    }))
  },

  setGeneratedDraftFeedback({ id, brandId, feedback }) {
    if (![1, -1].includes(feedback)) throw new Error('Feedback must be like or dislike.')
    return setGeneratedDraftFeedbackStmt.run(feedback, new Date().toISOString(), id, brandId).changes > 0
  },

  saveInteractionWorkflow(workflow) {
    const now = new Date().toISOString()
    const row = { ...workflow, createdAt: workflow.createdAt || now, updatedAt: now }
    saveInteractionWorkflowStmt.run(row.id, row.brandId, row.name, row.origin, JSON.stringify(row.steps), row.createdAt, row.updatedAt)
    return row
  },

  getInteractionWorkflows(brandId) {
    return getInteractionWorkflowsStmt.all(brandId).map(row => ({
      id: row.id,
      brandId: row.brandId,
      name: row.name,
      origin: row.origin,
      steps: JSON.parse(row.stepsJson || '[]'),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))
  },

  deleteInteractionWorkflow(id, brandId) {
    return deleteInteractionWorkflowStmt.run(id, brandId).changes > 0
  },
  }
}
