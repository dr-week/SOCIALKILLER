function mapPostRow(row) {
  if (!row) return null
  const approvalStatus = row.approvalStatus || (
    row.status === 'pending_approval' ? 'pending'
      : row.status === 'approved' ? 'approved'
        : row.status === 'rejected' ? 'rejected'
          : 'not_required'
  )
  return {
    id: row.id,
    brandId: row.brandId || 'danger-labs',
    title: row.title,
    topic: row.topic,
    contentType: row.contentType,
    status: row.status,
    approvalStatus,
    scheduledAt: row.scheduledAt,
    createdAt: row.createdAt,
    variants: JSON.parse(row.variantsJson || '{}'),
    deliveryLogs: JSON.parse(row.deliveryLogsJson || '[]'),
    imageUrl: row.imageUrl || null,
    webLink: row.webLink || null,
    videoUrl: row.videoUrl || null,
    hashtags: JSON.parse(row.hashtagsJson || '[]'),
    ...(row.platformsJson ? { platforms: JSON.parse(row.platformsJson) } : {}),
    ...(row.approvedAt ? { approvedAt: row.approvedAt } : {}),
    ...(row.rejectedAt ? { rejectedAt: row.rejectedAt } : {}),
    ...(row.confirmedAt ? { confirmedAt: row.confirmedAt } : {}),
    ...(row.handoffUrl ? { handoffUrl: row.handoffUrl } : {})
  }
}

export function createPublishingRepository(statements) {
  const { insertMetricStmt, getMetricsStmt, insertPostStmt, getAllPostsStmt, getPostByIdStmt, deletePostStmt, insertLogStmt, getLogsStmt, getBrandLogsStmt, insertDispStmt, getPendingDispStmt, deleteDispStmt } = statements
  return {
    addMetric({ postId = null, platformId = null, kind, value }) {
      const row = { postId, platformId, kind: String(kind), value: Math.round(Number(value)), recordedAt: new Date().toISOString() }
      if (!row.kind || !Number.isFinite(row.value)) throw new Error('metric needs kind and numeric value')
      insertMetricStmt.run(row.postId, row.platformId, row.kind, row.value, row.recordedAt)
      return row
    },
    getMetrics: () => getMetricsStmt.all(),

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
        JSON.stringify(post.hashtags || []),
        Array.isArray(post.platforms) ? JSON.stringify(post.platforms) : null,
        post.approvalStatus || null,
        post.approvedAt || null,
        post.rejectedAt || null,
        post.confirmedAt || null,
        post.handoffUrl || null
      )
      return post
    },

    getPostById: id => mapPostRow(getPostByIdStmt.get(id)),
    getAllPosts: () => getAllPostsStmt.all().map(mapPostRow),
    deletePost(postId) { deletePostStmt.run(postId); return true },

    addActivityLog(log) {
      insertLogStmt.run(log.id, log.brandId || 'danger-labs', log.timestamp || new Date().toISOString(), log.platformId, log.action, log.status, log.mode || null, log.intentUrl || null, log.externalUrl || null, log.message || '')
      return log
    },
    getActivityLogs(brandId = null) {
      return (brandId ? getBrandLogsStmt.all(brandId) : getLogsStmt.all()).map(row => ({ ...row, brandId: row.brandId || 'danger-labs' }))
    },

    pushDispatch(d) {
      insertDispStmt.run(d.id, d.postId || null, d.platformId, d.title || '', d.content || '', d.autoClickSubmit ? 1 : 0, d.queuedAt || new Date().toISOString())
      return d
    },
    getPendingDispatches() {
      return getPendingDispStmt.all().map(row => ({ id: row.id, postId: row.postId, platformId: row.platformId, title: row.title, content: row.content, autoClickSubmit: Boolean(row.autoClickSubmit), queuedAt: row.queuedAt }))
    },
    popDispatch(id = null) {
      const list = this.getPendingDispatches()
      const target = id ? list.find(d => d.id === id) : list[0]
      if (!target) return null
      deleteDispStmt.run(target.id)
      return target
    }
  }
}
