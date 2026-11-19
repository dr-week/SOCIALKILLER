export function initializeAutomationSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_rules (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL,
      name TEXT NOT NULL,
      triggerType TEXT NOT NULL,
      triggerConfigJson TEXT NOT NULL,
      conditionsJson TEXT NOT NULL,
      actionsJson TEXT NOT NULL,
      elseActionsJson TEXT NOT NULL DEFAULT '[]',
      enabled INTEGER NOT NULL DEFAULT 0,
      lastRunAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_automation_rules_brand_enabled
      ON automation_rules(brandId, enabled, updatedAt DESC);
    CREATE TABLE IF NOT EXISTS automation_runs (
      id TEXT PRIMARY KEY,
      ruleId TEXT NOT NULL,
      brandId TEXT NOT NULL,
      triggerId TEXT NOT NULL,
      inputJson TEXT NOT NULL,
      actionResultsJson TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL,
      error TEXT,
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      UNIQUE(ruleId, triggerId),
      FOREIGN KEY(ruleId) REFERENCES automation_rules(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_automation_runs_brand_time
      ON automation_runs(brandId, startedAt DESC);
  `)
  const columns = db.prepare('PRAGMA table_info(automation_rules)').all()
  if (!columns.some(column => column.name === 'elseActionsJson')) {
    db.exec("ALTER TABLE automation_rules ADD COLUMN elseActionsJson TEXT NOT NULL DEFAULT '[]'")
  }
}
