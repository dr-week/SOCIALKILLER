/**
 * Native SQLite connection and backward-compatible startup migrations.
 */

import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { initializeSchema } from './schema.mjs'
import { createDbStatements } from './statements.mjs'
import { createDbService } from './repositories/index.mjs'

const dataDir = join(process.cwd(), '.data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = join(dataDir, 'followdesk.sqlite')
export const db = new DatabaseSync(dbPath)

// Initialize performance & integrity pragmas
try {
  db.exec(`PRAGMA busy_timeout = 5000;`)
  db.exec(`PRAGMA journal_mode = WAL;`)
  db.exec(`PRAGMA synchronous = NORMAL;`)
  db.exec(`PRAGMA foreign_keys = ON;`)
} catch (e) {
  // If database locked by another concurrent process, retry once with backoff
  try {
    db.exec(`PRAGMA busy_timeout = 5000;`)
  } catch {}
}

initializeSchema(db)

// Backward-compatible additive migration for existing local databases.
const brandProfileColumns = db.prepare(`PRAGMA table_info(brand_profiles)`).all()
if (!brandProfileColumns.some(column => column.name === 'archivedAt')) {
  db.exec(`ALTER TABLE brand_profiles ADD COLUMN archivedAt TEXT`)
}

// Migrate existing installs without dropping campaign or credential data.
if (!db.prepare(`PRAGMA table_info(social_posts)`).all().some(column => column.name === 'brandId')) {
  db.exec(`ALTER TABLE social_posts ADD COLUMN brandId TEXT NOT NULL DEFAULT 'danger-labs'`)
}
if (!db.prepare(`PRAGMA table_info(activity_logs)`).all().some(column => column.name === 'brandId')) {
  db.exec(`ALTER TABLE activity_logs ADD COLUMN brandId TEXT NOT NULL DEFAULT 'danger-labs'`)
}
db.exec(`
  INSERT OR IGNORE INTO brand_platform_vault (brandId, platformId, encryptedSecret, iv, authTag, updatedAt)
  SELECT 'danger-labs', platformId, encryptedSecret, iv, authTag, updatedAt FROM platform_vault;
  CREATE INDEX IF NOT EXISTS idx_posts_brand_status ON social_posts(brandId, status);
`)


const statements = createDbStatements(db)
export const dbService = createDbService(statements)
