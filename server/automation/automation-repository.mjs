export function createAutomationRepository(db) {
  const insertRule = db.prepare(`
    INSERT INTO automation_rules
      (id, brandId, name, triggerType, triggerConfigJson, conditionsJson, actionsJson, elseActionsJson, enabled, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const updateRule = db.prepare(`
    UPDATE automation_rules
    SET name=?, triggerType=?, triggerConfigJson=?, conditionsJson=?, actionsJson=?, elseActionsJson=?, updatedAt=?
    WHERE id=? AND brandId=?
  `)
  const selectRule = db.prepare('SELECT * FROM automation_rules WHERE id=? AND brandId=?')
  const selectRules = db.prepare('SELECT * FROM automation_rules WHERE brandId=? ORDER BY updatedAt DESC')
  const selectEnabledRules = db.prepare('SELECT * FROM automation_rules WHERE brandId=? AND enabled=1')
  const selectScheduledRules = db.prepare("SELECT * FROM automation_rules WHERE enabled=1 AND triggerType='schedule'")
  const setEnabled = db.prepare('UPDATE automation_rules SET enabled=?, updatedAt=? WHERE id=? AND brandId=?')
  const touchRule = db.prepare('UPDATE automation_rules SET lastRunAt=?, updatedAt=? WHERE id=? AND brandId=?')
  const deleteRule = db.prepare('DELETE FROM automation_rules WHERE id=? AND brandId=?')
  const insertRun = db.prepare(`
    INSERT OR IGNORE INTO automation_runs
      (id, ruleId, brandId, triggerId, inputJson, actionResultsJson, status, startedAt)
    VALUES (?, ?, ?, ?, ?, '[]', 'running', ?)
  `)
  const selectRun = db.prepare('SELECT * FROM automation_runs WHERE id=? AND brandId=?')
  const selectRunByTrigger = db.prepare('SELECT * FROM automation_runs WHERE ruleId=? AND triggerId=?')
  const selectRuns = db.prepare('SELECT * FROM automation_runs WHERE brandId=? ORDER BY startedAt DESC LIMIT ?')
  const updateRun = db.prepare(`
    UPDATE automation_runs SET actionResultsJson=?, status=?, error=?, startedAt=?, completedAt=?
    WHERE id=? AND brandId=?
  `)

  const parseRule = row => row && ({
    ...row,
    enabled: Boolean(row.enabled),
    triggerConfig: JSON.parse(row.triggerConfigJson),
    conditions: JSON.parse(row.conditionsJson),
    actions: JSON.parse(row.actionsJson),
    elseActions: JSON.parse(row.elseActionsJson || '[]')
  })
  const parseRun = row => row && ({
    ...row,
    input: JSON.parse(row.inputJson),
    actionResults: JSON.parse(row.actionResultsJson)
  })

  return {
    saveRule(rule) {
      const now = new Date().toISOString()
      if (selectRule.get(rule.id, rule.brandId)) {
        updateRule.run(rule.name, rule.triggerType, JSON.stringify(rule.triggerConfig), JSON.stringify(rule.conditions), JSON.stringify(rule.actions), JSON.stringify(rule.elseActions || []), now, rule.id, rule.brandId)
      } else {
        insertRule.run(rule.id, rule.brandId, rule.name, rule.triggerType, JSON.stringify(rule.triggerConfig), JSON.stringify(rule.conditions), JSON.stringify(rule.actions), JSON.stringify(rule.elseActions || []), Number(rule.enabled), now, now)
      }
      return this.getRule(rule.id, rule.brandId)
    },
    getRule: (id, brandId) => parseRule(selectRule.get(id, brandId)),
    getRules: brandId => selectRules.all(brandId).map(parseRule),
    getEnabledRules: brandId => selectEnabledRules.all(brandId).map(parseRule),
    getScheduledRules: () => selectScheduledRules.all().map(parseRule),
    setEnabled(id, brandId, enabled) {
      return setEnabled.run(Number(enabled), new Date().toISOString(), id, brandId).changes > 0
    },
    touchRule(id, brandId, at) { touchRule.run(at, at, id, brandId) },
    deleteRule(id, brandId) { return deleteRule.run(id, brandId).changes > 0 },
    beginRun(run) {
      insertRun.run(run.id, run.ruleId, run.brandId, run.triggerId, JSON.stringify(run.input), new Date().toISOString())
      return this.getRunByTrigger(run.ruleId, run.triggerId)
    },
    getRun: (id, brandId) => parseRun(selectRun.get(id, brandId)),
    getRunByTrigger: (ruleId, triggerId) => parseRun(selectRunByTrigger.get(ruleId, triggerId)),
    getRuns(brandId, limit = 30) { return selectRuns.all(brandId, Math.max(1, Math.min(100, limit))).map(parseRun) },
    updateRun(run) {
      updateRun.run(JSON.stringify(run.actionResults), run.status, run.error || null, run.startedAt, run.completedAt || null, run.id, run.brandId)
      return this.getRun(run.id, run.brandId)
    }
  }
}
