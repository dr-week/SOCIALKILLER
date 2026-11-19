/**
 * Pillar 5: Visual Bot Locator Cache & Text Summarization Vault Schema (<75 lines)
 * Powers Stagehand/Midscene semantic DOM+Sobel selector caching and instant micro-briefs.
 */
export function initializeVisualBotSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS visual_bot_locators (
      id TEXT PRIMARY KEY,
      origin TEXT NOT NULL,
      elementRole TEXT NOT NULL DEFAULT 'button',
      semanticLabel TEXT NOT NULL,
      cachedSelector TEXT NOT NULL,
      sobelTemplateId TEXT NOT NULL DEFAULT '',
      successCount INTEGER NOT NULL DEFAULT 1,
      failCount INTEGER NOT NULL DEFAULT 0,
      lastVerifiedAt TEXT NOT NULL,
      UNIQUE (origin, elementRole, semanticLabel)
    );
    CREATE INDEX IF NOT EXISTS idx_visual_locators_origin ON visual_bot_locators(origin, lastVerifiedAt DESC);

    CREATE TABLE IF NOT EXISTS content_summaries (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL DEFAULT 'danger-labs',
      sourceUrl TEXT NOT NULL DEFAULT '',
      sourceHash TEXT NOT NULL,
      originalWordCount INTEGER NOT NULL DEFAULT 0,
      tldr TEXT NOT NULL,
      bulletsJson TEXT NOT NULL DEFAULT '[]',
      channelBriefsJson TEXT NOT NULL DEFAULT '{}',
      createdAt TEXT NOT NULL,
      UNIQUE (brandId, sourceHash)
    );
    CREATE INDEX IF NOT EXISTS idx_summaries_brand_time ON content_summaries(brandId, createdAt DESC);
  `)
}
