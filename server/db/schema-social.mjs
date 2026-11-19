export function initializeSocialSchema(db) {
  db.exec(`

  CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY,
    brandId TEXT NOT NULL DEFAULT 'danger-labs',
    title TEXT NOT NULL,
    topic TEXT,
    contentType TEXT DEFAULT 'multi_channel',
    status TEXT NOT NULL,
    scheduledAt TEXT,
    createdAt TEXT NOT NULL,
    variantsJson TEXT NOT NULL,
    deliveryLogsJson TEXT,
    imageUrl TEXT,
    webLink TEXT,
    videoUrl TEXT,
    hashtagsJson TEXT,
    platformsJson TEXT,
    approvalStatus TEXT,
    approvedAt TEXT,
    rejectedAt TEXT,
    confirmedAt TEXT,
    handoffUrl TEXT
  );


  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    brandId TEXT NOT NULL DEFAULT 'danger-labs',
    timestamp TEXT NOT NULL,
    platformId TEXT NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    mode TEXT,
    intentUrl TEXT,
    externalUrl TEXT,
    message TEXT
  );

  CREATE TABLE IF NOT EXISTS pending_dispatches (
    id TEXT PRIMARY KEY,
    postId TEXT,
    platformId TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    autoClickSubmit INTEGER DEFAULT 0,
    queuedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS synced_accounts (
    username TEXT PRIMARY KEY,
    followersCount INTEGER DEFAULT 0,
    followingCount INTEGER DEFAULT 0,
    dataJson TEXT NOT NULL,
    syncedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS post_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT,
    platformId TEXT,
    kind TEXT NOT NULL,
    value INTEGER NOT NULL,
    recordedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS idempotency_tokens (
    token TEXT PRIMARY KEY,
    scope TEXT NOT NULL,
    source TEXT NOT NULL,
    payloadHash TEXT,
    metadataJson TEXT,
    createdAt TEXT NOT NULL,
    expiresAt TEXT
  );

  CREATE TABLE IF NOT EXISTS scheduler_state (
    key TEXT PRIMARY KEY,
    valueJson TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hook TEXT,
    debate TEXT,
    question TEXT,
    githubSolution TEXT,
    callToAction TEXT,
    pillar TEXT DEFAULT 'Custom Topics',
    usedCount INTEGER DEFAULT 0,
    lastUsedAt TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS platform_vault (
    platformId TEXT PRIMARY KEY,
    encryptedSecret TEXT NOT NULL,
    iv TEXT NOT NULL,
    authTag TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dynamic_dictionary (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'hook', 'conflict', 'insight', 'debate', 'title_format'
    text TEXT NOT NULL,
    source TEXT NOT NULL, -- 'reddit', 'stackoverflow', 'hackernews', 'curated'
    score REAL DEFAULT 1.0,
    usedCount INTEGER DEFAULT 0,
    lastUsedAt TEXT,
    createdAt TEXT NOT NULL
  );
  `)
}
