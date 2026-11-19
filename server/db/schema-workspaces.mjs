export function initializeWorkspaceSchema(db) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS brand_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    location TEXT DEFAULT 'Goa, India',
    purposeJson TEXT NOT NULL,
    accountsJson TEXT DEFAULT '[]',
    milestonesJson TEXT DEFAULT '[]',
    updatedAt TEXT NOT NULL,
    archivedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS brand_platform_vault (
    brandId TEXT NOT NULL,
    platformId TEXT NOT NULL,
    encryptedSecret TEXT NOT NULL,
    iv TEXT NOT NULL,
    authTag TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    PRIMARY KEY (brandId, platformId)
  );

  CREATE TABLE IF NOT EXISTS interaction_workflows (
    id TEXT PRIMARY KEY,
    brandId TEXT NOT NULL,
    name TEXT NOT NULL,
    origin TEXT NOT NULL,
    stepsJson TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS generated_drafts (
    id TEXT PRIMARY KEY,
    brandId TEXT NOT NULL,
    platformId TEXT NOT NULL,
    topicKey TEXT NOT NULL,
    sourceKey TEXT NOT NULL DEFAULT '',
    contentHash TEXT NOT NULL,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    sourceUrl TEXT NOT NULL DEFAULT '',
    context TEXT NOT NULL,
    templateId TEXT NOT NULL,
    feedback INTEGER CHECK (feedback IS NULL OR feedback IN (-1, 1)),
    feedbackAt TEXT,
    createdAt TEXT NOT NULL,
    UNIQUE (brandId, platformId, topicKey),
    UNIQUE (brandId, platformId, contentHash)
  );

  CREATE TABLE IF NOT EXISTS inbox_interactions (
    id TEXT PRIMARY KEY,
    brandId TEXT NOT NULL,
    platformId TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'comment',
    contactName TEXT NOT NULL DEFAULT 'Customer',
    message TEXT NOT NULL,
    replyDraft TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_inbox_brand_status ON inbox_interactions(brandId, status, updatedAt DESC);

  CREATE INDEX IF NOT EXISTS idx_posts_status ON social_posts(status);
  CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON activity_logs(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_disp_queued ON pending_dispatches(queuedAt ASC);
  CREATE INDEX IF NOT EXISTS idx_idempotency_scope ON idempotency_tokens(scope, createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_user_topics_status ON user_topics(status, usedCount ASC);
  CREATE INDEX IF NOT EXISTS idx_dynamic_dict_type ON dynamic_dictionary(type, usedCount ASC);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_generated_drafts_source ON generated_drafts(brandId, platformId, sourceKey) WHERE sourceKey <> '';
  CREATE INDEX IF NOT EXISTS idx_generated_drafts_feedback ON generated_drafts(brandId, platformId, templateId, feedback);
  `)
}
