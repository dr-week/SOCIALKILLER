export function createUserTopicRepository(statements) {
  const { insertUserTopicStmt, getAllUserTopicsStmt, getPendingUserTopicsStmt, incrementUserTopicUseStmt, deleteUserTopicStmt } = statements
  return {
  saveUserTopic(topic) {
    const id = topic.id || `topic-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const title = topic.title || topic.hook || 'Custom Developer Topic'
    const hook = topic.hook || title
    const debate = topic.debate || ''
    const question = topic.question || ''
    const githubSolution = topic.githubSolution || ''
    const callToAction = topic.callToAction || ''
    const pillar = topic.pillar || 'Custom Topics'
    const usedCount = Number(topic.usedCount || 0)
    const lastUsedAt = topic.lastUsedAt || null
    const status = topic.status || 'pending'
    const createdAt = topic.createdAt || new Date().toISOString()

    insertUserTopicStmt.run(id, title, hook, debate, question, githubSolution, callToAction, pillar, usedCount, lastUsedAt, status, createdAt)
    return { id, title, hook, debate, question, githubSolution, callToAction, pillar, usedCount, lastUsedAt, status, createdAt }
  },

  getAllUserTopics() {
    return getAllUserTopicsStmt.all()
  },

  getPendingUserTopics() {
    return getPendingUserTopicsStmt.all()
  },

  markUserTopicUsed(id, status = 'used') {
    const lastUsedAt = new Date().toISOString()
    incrementUserTopicUseStmt.run(lastUsedAt, status, id)
    return { id, lastUsedAt, status }
  },

  deleteUserTopic(id) {
    const info = deleteUserTopicStmt.run(id)
    return info.changes > 0
  },
  }
}
