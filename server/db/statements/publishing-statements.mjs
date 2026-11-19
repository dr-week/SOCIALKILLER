export function createPublishingStatements(db) {
  const insertPostStmt = db.prepare(`
    INSERT OR REPLACE INTO social_posts (
      id, brandId, title, topic, contentType, status, scheduledAt, createdAt,
      variantsJson, deliveryLogsJson, imageUrl, webLink, videoUrl, hashtagsJson,
      platformsJson, approvalStatus, approvedAt, rejectedAt, confirmedAt, handoffUrl
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const getAllPostsStmt = db.prepare(`SELECT * FROM social_posts ORDER BY createdAt DESC`)
  const getPostByIdStmt = db.prepare(`SELECT * FROM social_posts WHERE id = ?`)
  const deletePostStmt = db.prepare(`DELETE FROM social_posts WHERE id = ?`)

  const insertLogStmt = db.prepare(`
    INSERT INTO activity_logs (id, brandId, timestamp, platformId, action, status, mode, intentUrl, externalUrl, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const getLogsStmt = db.prepare(`SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 150`)
  const getBrandLogsStmt = db.prepare(`SELECT * FROM activity_logs WHERE brandId = ? ORDER BY timestamp DESC LIMIT 150`)

  const insertDispStmt = db.prepare(`
    INSERT OR REPLACE INTO pending_dispatches (id, postId, platformId, title, content, autoClickSubmit, queuedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const getPendingDispStmt = db.prepare(`SELECT * FROM pending_dispatches ORDER BY queuedAt ASC`)
  const deleteDispStmt = db.prepare(`DELETE FROM pending_dispatches WHERE id = ?`)

  const insertMetricStmt = db.prepare(`
    INSERT INTO post_metrics (postId, platformId, kind, value, recordedAt) VALUES (?, ?, ?, ?, ?)
  `)
  const getMetricsStmt = db.prepare(`SELECT * FROM post_metrics ORDER BY recordedAt ASC LIMIT 5000`)

  const insertIdempotencyStmt = db.prepare(`
    INSERT INTO idempotency_tokens (token, scope, source, payloadHash, metadataJson, createdAt, expiresAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const getIdempotencyStmt = db.prepare(`SELECT * FROM idempotency_tokens WHERE token = ?`)
  const getIdempotencyByHashStmt = db.prepare(`
    SELECT * FROM idempotency_tokens WHERE scope = ? AND payloadHash = ? ORDER BY createdAt DESC LIMIT 1
  `)
  const cleanExpiredTokensStmt = db.prepare(`
    DELETE FROM idempotency_tokens WHERE expiresAt IS NOT NULL AND expiresAt < ?
  `)

  const setSchedulerStateStmt = db.prepare(`
    INSERT OR REPLACE INTO scheduler_state (key, valueJson, updatedAt) VALUES (?, ?, ?)
  `)
  const getSchedulerStateStmt = db.prepare(`SELECT valueJson FROM scheduler_state WHERE key = ?`)
  const getAllSchedulerStateStmt = db.prepare(`SELECT * FROM scheduler_state`)

  return {
    insertPostStmt, getAllPostsStmt, getPostByIdStmt, deletePostStmt,
    insertLogStmt, getLogsStmt, getBrandLogsStmt,
    insertDispStmt, getPendingDispStmt, deleteDispStmt,
    insertMetricStmt, getMetricsStmt,
    insertIdempotencyStmt, getIdempotencyStmt, getIdempotencyByHashStmt, cleanExpiredTokensStmt,
    setSchedulerStateStmt, getSchedulerStateStmt, getAllSchedulerStateStmt
  }
}
