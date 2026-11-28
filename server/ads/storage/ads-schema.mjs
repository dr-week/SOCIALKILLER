/**
 * SQLite WAL schema for the Micro-Modular Ad Buying AI.
 * Tables: ad_campaigns, ad_adsets, ad_metrics_daily, ad_audit_logs.
 */

export function initializeAdsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL DEFAULT 'danger-labs',
      platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok')),
      name TEXT NOT NULL,
      objective TEXT NOT NULL DEFAULT 'conversions',
      status TEXT NOT NULL DEFAULT 'PAUSED',
      dailyBudget REAL NOT NULL DEFAULT 0,
      targetCpa REAL NOT NULL DEFAULT 25,
      targetRoas REAL NOT NULL DEFAULT 3.0,
      framework TEXT NOT NULL DEFAULT '3-2-2-dct',
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ad_adsets (
      id TEXT PRIMARY KEY,
      campaignId TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PAUSED',
      dailyBudget REAL NOT NULL DEFAULT 0,
      audienceSpec TEXT DEFAULT '{}',
      creativeIdsJson TEXT DEFAULT '[]',
      banditAlpha REAL NOT NULL DEFAULT 1.0,
      banditBeta REAL NOT NULL DEFAULT 1.0,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (campaignId) REFERENCES ad_campaigns(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ad_metrics_daily (
      id TEXT PRIMARY KEY,
      entityId TEXT NOT NULL,
      entityType TEXT NOT NULL CHECK (entityType IN ('campaign', 'adset', 'creative')),
      platform TEXT NOT NULL,
      date TEXT NOT NULL,
      spend REAL NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      revenue REAL NOT NULL DEFAULT 0,
      frequency REAL NOT NULL DEFAULT 1.0,
      UNIQUE(entityId, date)
    );

    CREATE TABLE IF NOT EXISTS ad_audit_logs (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL DEFAULT 'danger-labs',
      entityId TEXT NOT NULL,
      action TEXT NOT NULL,
      ruleId TEXT DEFAULT '',
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_approval',
      payloadJson TEXT DEFAULT '{}',
      createdAt TEXT NOT NULL,
      executedAt TEXT
    );
  `)
}
