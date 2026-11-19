export function createDbStatements(db) {
// Prepared queries for optimal performance
const insertPostStmt = db.prepare(`
  INSERT OR REPLACE INTO social_posts (id, brandId, title, topic, contentType, status, scheduledAt, createdAt, variantsJson, deliveryLogsJson, imageUrl, webLink, videoUrl, hashtagsJson)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const getAllPostsStmt = db.prepare(`SELECT * FROM social_posts ORDER BY createdAt DESC`)
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

const insertUserTopicStmt = db.prepare(`
  INSERT OR REPLACE INTO user_topics (id, title, hook, debate, question, githubSolution, callToAction, pillar, usedCount, lastUsedAt, status, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)
const getAllUserTopicsStmt = db.prepare(`SELECT * FROM user_topics ORDER BY createdAt DESC`)
const getPendingUserTopicsStmt = db.prepare(`SELECT * FROM user_topics WHERE status = 'pending' ORDER BY usedCount ASC, createdAt ASC`)
const incrementUserTopicUseStmt = db.prepare(`
  UPDATE user_topics SET usedCount = usedCount + 1, lastUsedAt = ?, status = ? WHERE id = ?
`)
const deleteUserTopicStmt = db.prepare(`DELETE FROM user_topics WHERE id = ?`)

const insertVaultStmt = db.prepare(`
  INSERT OR REPLACE INTO platform_vault (platformId, encryptedSecret, iv, authTag, updatedAt)
  VALUES (?, ?, ?, ?, ?)
`)
const getVaultStmt = db.prepare(`SELECT * FROM platform_vault WHERE platformId = ?`)
const deleteVaultStmt = db.prepare(`DELETE FROM platform_vault WHERE platformId = ?`)
const getAllVaultStmt = db.prepare(`SELECT platformId, updatedAt FROM platform_vault`)
const insertBrandVaultStmt = db.prepare(`
  INSERT OR REPLACE INTO brand_platform_vault (brandId, platformId, encryptedSecret, iv, authTag, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?)
`)
const getBrandVaultStmt = db.prepare(`SELECT * FROM brand_platform_vault WHERE brandId = ? AND platformId = ?`)

const insertDictItemStmt = db.prepare(`
  INSERT OR REPLACE INTO dynamic_dictionary (id, type, text, source, score, usedCount, lastUsedAt, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)
const getDictByTypeStmt = db.prepare(`
  SELECT * FROM dynamic_dictionary WHERE type = ? ORDER BY usedCount ASC, score DESC LIMIT 100
`)
const incrementDictUsageStmt = db.prepare(`
  UPDATE dynamic_dictionary SET usedCount = usedCount + 1, lastUsedAt = ? WHERE id = ?
`)
const getAllDictItemsStmt = db.prepare(`SELECT * FROM dynamic_dictionary ORDER BY createdAt DESC`)

const insertBrandStmt = db.prepare(`
  INSERT INTO brand_profiles (id, name, tagline, location, purposeJson, accountsJson, milestonesJson, updatedAt, archivedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, tagline = excluded.tagline,
    location = excluded.location, purposeJson = excluded.purposeJson,
    accountsJson = excluded.accountsJson, milestonesJson = excluded.milestonesJson,
    updatedAt = excluded.updatedAt,
    archivedAt = CASE WHEN excluded.archivedAt IS NULL THEN brand_profiles.archivedAt ELSE excluded.archivedAt END
`)
const getBrandStmt = db.prepare(`SELECT * FROM brand_profiles WHERE id = ?`)
const getAllBrandsStmt = db.prepare(`SELECT * FROM brand_profiles WHERE archivedAt IS NULL ORDER BY name ASC`)
const getArchivedBrandsStmt = db.prepare(`SELECT * FROM brand_profiles WHERE archivedAt IS NOT NULL ORDER BY name ASC`)
const deleteBrandStmt = db.prepare(`DELETE FROM brand_profiles WHERE id = ?`)
const archiveBrandStmt = db.prepare(`UPDATE brand_profiles SET archivedAt = ?, updatedAt = ? WHERE id = ? AND archivedAt IS NULL`)
const restoreBrandStmt = db.prepare(`UPDATE brand_profiles SET archivedAt = NULL, updatedAt = ? WHERE id = ? AND archivedAt IS NOT NULL`)
const saveInteractionWorkflowStmt = db.prepare(`
  INSERT INTO interaction_workflows (id, brandId, name, origin, stepsJson, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, origin = excluded.origin,
    stepsJson = excluded.stepsJson, updatedAt = excluded.updatedAt
`)
const getInteractionWorkflowsStmt = db.prepare(`SELECT * FROM interaction_workflows WHERE brandId = ? ORDER BY updatedAt DESC`)
const deleteInteractionWorkflowStmt = db.prepare(`DELETE FROM interaction_workflows WHERE id = ? AND brandId = ?`)
const insertGeneratedDraftStmt = db.prepare(`
  INSERT OR IGNORE INTO generated_drafts
    (id, brandId, platformId, topicKey, sourceKey, contentHash, topic, content, source, sourceUrl, context, templateId, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)
const hasGeneratedDraftStmt = db.prepare(`
  SELECT 1 FROM generated_drafts
  WHERE brandId = ? AND platformId = ? AND (topicKey = ? OR (? <> '' AND sourceKey = ?) OR contentHash = ?)
  LIMIT 1
`)
const getGeneratedDraftTopicsStmt = db.prepare(`SELECT topic FROM generated_drafts WHERE brandId = ? AND platformId = ?`)
const generatedDraftFeedbackStatsStmt = db.prepare(`
  SELECT templateId,
    SUM(CASE WHEN feedback = 1 THEN 1 ELSE 0 END) AS likes,
    SUM(CASE WHEN feedback = -1 THEN 1 ELSE 0 END) AS dislikes
  FROM generated_drafts WHERE brandId = ? AND platformId = ? GROUP BY templateId
`)
const setGeneratedDraftFeedbackStmt = db.prepare(`
  UPDATE generated_drafts SET feedback = ?, feedbackAt = ? WHERE id = ? AND brandId = ?
`)
  return { insertPostStmt, getAllPostsStmt, deletePostStmt, insertLogStmt, getLogsStmt, getBrandLogsStmt, insertDispStmt, getPendingDispStmt, deleteDispStmt, insertMetricStmt, getMetricsStmt, insertIdempotencyStmt, getIdempotencyStmt, getIdempotencyByHashStmt, cleanExpiredTokensStmt, setSchedulerStateStmt, getSchedulerStateStmt, getAllSchedulerStateStmt, insertUserTopicStmt, getAllUserTopicsStmt, getPendingUserTopicsStmt, incrementUserTopicUseStmt, deleteUserTopicStmt, insertVaultStmt, getVaultStmt, deleteVaultStmt, getAllVaultStmt, insertBrandVaultStmt, getBrandVaultStmt, insertDictItemStmt, getDictByTypeStmt, incrementDictUsageStmt, getAllDictItemsStmt, insertBrandStmt, getBrandStmt, getAllBrandsStmt, getArchivedBrandsStmt, deleteBrandStmt, archiveBrandStmt, restoreBrandStmt, saveInteractionWorkflowStmt, getInteractionWorkflowsStmt, deleteInteractionWorkflowStmt, insertGeneratedDraftStmt, hasGeneratedDraftStmt, getGeneratedDraftTopicsStmt, generatedDraftFeedbackStatsStmt, setGeneratedDraftFeedbackStmt }
}
