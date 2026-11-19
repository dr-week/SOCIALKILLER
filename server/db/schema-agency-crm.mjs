/**
 * Pillar 4: Solo-Agency CRM, Leads & Client Deliverables Schema (<75 lines)
 * Enables 1 creator to replace an entire agency's CRM and client reporting stack locally.
 */
export function initializeAgencyCrmSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL DEFAULT 'danger-labs',
      contactName TEXT NOT NULL,
      handle TEXT NOT NULL DEFAULT '',
      platformId TEXT NOT NULL DEFAULT 'instagram',
      source TEXT NOT NULL DEFAULT 'comment',
      triggerWord TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      intent TEXT NOT NULL DEFAULT 'inquiry',
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_leads_brand_status ON leads(brandId, status, updatedAt DESC);

    CREATE TABLE IF NOT EXISTS client_deliverables (
      id TEXT PRIMARY KEY,
      brandId TEXT NOT NULL DEFAULT 'danger-labs',
      projectId TEXT NOT NULL DEFAULT 'retainer',
      title TEXT NOT NULL,
      period TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      reviewerNotes TEXT NOT NULL DEFAULT '',
      dueAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_deliverables_brand_status ON client_deliverables(brandId, status, updatedAt DESC);
  `)
}
