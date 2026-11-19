export function createPublishingRepository(statements) {
  const { insertMetricStmt, getMetricsStmt, insertPostStmt, getAllPostsStmt, deletePostStmt, insertLogStmt, getLogsStmt, getBrandLogsStmt, insertDispStmt, getPendingDispStmt, deleteDispStmt } = statements
  return {
  addMetric({ postId = null, platformId = null, kind, value }) {
    const row = { postId, platformId, kind: String(kind), value: Math.round(Number(value)), recordedAt: new Date().toISOString() }
    if (!row.kind || !Number.isFinite(row.value)) throw new Error('metric needs kind and numeric value')
    insertMetricStmt.run(row.postId, row.platformId, row.kind, row.value, row.recordedAt)
    return row
  },

  getMetrics() {
    return getMetricsStmt.all()
  },

  savePost(post) {
    insertPostStmt.run(
      post.id,
      post.brandId || 'danger-labs',
      post.title || '',
      post.topic || '',
      post.contentType || 'multi_channel',
      post.status || 'published',
      post.scheduledAt || null,
      post.createdAt || new Date().toISOString(),
      JSON.stringify(post.variants || {}),
      JSON.stringify(post.deliveryLogs || []),
      post.imageUrl || null,
      post.webLink || null,
      post.videoUrl || null,
      JSON.stringify(post.hashtags || [])
    )
    return post
  },

  getAllPosts() {
    return getAllPostsStmt.all().map(row => ({
      id: row.id,
      brandId: row.brandId || 'danger-labs',
      title: row.title,
      topic: row.topic,
      contentType: row.contentType,
      status: row.status,
      scheduledAt: row.scheduledAt,
      createdAt: row.createdAt,
      variants: JSON.parse(row.variantsJson || '{}'),
      deliveryLogs: JSON.parse(row.deliveryLogsJson || '[]'),
      imageUrl: row.imageUrl || null,
      webLink: row.webLink || null,
      videoUrl: row.videoUrl || null,
      hashtags: JSON.parse(row.hashtagsJson || '[]')
    }))
  },

  deletePost(postId) {
    deletePostStmt.run(postId)
    return true
  },

  addActivityLog(log) {
    insertLogStmt.run(
      log.id,
      log.brandId || 'danger-labs',
      log.timestamp || new Date().toISOString(),
      log.platformId,
      log.action,
      log.status,
      log.mode || null,
      log.intentUrl || null,
      log.externalUrl || null,
      log.message || ''
    )
    return log
  },

  getActivityLogs(brandId = null) {
    return (brandId ? getBrandLogsStmt.all(brandId) : getLogsStmt.all()).map(row => ({ ...row, brandId: row.brandId || 'danger-labs' }))
  },

  pushDispatch(d) {
    insertDispStmt.run(
      d.id,
      d.postId || null,
      d.platformId,
      d.title || '',
      d.content || '',
      d.autoClickSubmit ? 1 : 0,
      d.queuedAt || new Date().toISOString()
    )
    return d
  },

  getPendingDispatches() {
    return getPendingDispStmt.all().map(row => ({
      id: row.id,
      postId: row.postId,
      platformId: row.platformId,
      title: row.title,
      content: row.content,
      autoClickSubmit: Boolean(row.autoClickSubmit),
      queuedAt: row.queuedAt
    }))
  },

  popDispatch(id = null) {
    const list = this.getPendingDispatches()
    const target = id ? list.find(d => d.id === id) : list[0]
    if (target) {
      deleteDispStmt.run(target.id)
      return target
    }
    return null
  },
  }
}
