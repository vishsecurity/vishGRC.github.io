const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

function createDatabase(databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      framework TEXT NOT NULL,
      audit_type TEXT NOT NULL DEFAULT 'Internal',
      objective TEXT NOT NULL,
      scope TEXT NOT NULL,
      criteria TEXT NOT NULL,
      risk_level TEXT NOT NULL DEFAULT 'Medium',
      lead_auditor TEXT NOT NULL,
      team_competence TEXT NOT NULL DEFAULT '',
      independence_notes TEXT NOT NULL DEFAULT '',
      communication_plan TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Planned',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
      reference TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      procedure TEXT NOT NULL,
      sampling_method TEXT NOT NULL DEFAULT '',
      evidence_expected TEXT NOT NULL DEFAULT '',
      result TEXT NOT NULL DEFAULT 'Not tested',
      notes TEXT NOT NULL DEFAULT '',
      tested_by TEXT NOT NULL DEFAULT '',
      tested_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
      test_id INTEGER REFERENCES audit_tests(id) ON DELETE SET NULL,
      reference TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      criteria TEXT NOT NULL,
      condition TEXT NOT NULL,
      cause TEXT NOT NULL DEFAULT '',
      impact TEXT NOT NULL DEFAULT '',
      severity TEXT NOT NULL DEFAULT 'Medium',
      owner TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      corrective_action TEXT NOT NULL DEFAULT '',
      closure_evidence TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id INTEGER REFERENCES audit_programs(id) ON DELETE SET NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      action TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      actor TEXT NOT NULL DEFAULT 'Local prototype user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Editor', 'Viewer')),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS user_sessions_expiry_idx ON user_sessions(expires_at);

    CREATE TABLE IF NOT EXISTS evidence_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL REFERENCES audit_tests(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      storage_name TEXT NOT NULL UNIQUE,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      uploaded_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seed_markers (
      name TEXT PRIMARY KEY,
      seeded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workspace_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      organization_name TEXT NOT NULL,
      workspace_label TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS regulatory_obligations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      reference TEXT NOT NULL DEFAULT '',
      regulator TEXT NOT NULL,
      issued_date TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL,
      applicability TEXT NOT NULL DEFAULT 'Assessing',
      due_date TEXT NOT NULL,
      implementation TEXT NOT NULL DEFAULT 'Not started',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      domain TEXT NOT NULL,
      inherent TEXT NOT NULL DEFAULT 'Medium',
      residual TEXT NOT NULL DEFAULT 'Medium',
      owner TEXT NOT NULL,
      review_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In review',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS controls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      frameworks TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT '',
      last_test TEXT NOT NULL DEFAULT '',
      evidence_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Needs review',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT '',
      purpose TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL,
      impact TEXT NOT NULL DEFAULT 'Unassessed',
      oversight TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Proposed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      system TEXT NOT NULL DEFAULT '',
      dimension TEXT NOT NULL,
      inherent TEXT NOT NULL DEFAULT 'Medium',
      treatment TEXT NOT NULL DEFAULT '',
      owner TEXT NOT NULL,
      residual TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Treatment',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const ensureColumn = (table, column, definition) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!columns.some(item => item.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  };
  ensureColumn("audit_programs", "team_competence", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("audit_programs", "independence_notes", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("audit_programs", "communication_plan", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("audit_tests", "sampling_method", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("audit_events", "actor", "TEXT NOT NULL DEFAULT 'Local prototype user'");

  seedDemoAudit(db);
  seedDemoObligations(db);
  seedDemoGrcRecords(db);
  db.prepare(`
    INSERT OR IGNORE INTO workspace_settings (id, organization_name, workspace_label)
    VALUES (1, 'Governance Guard', 'Enterprise workspace')
  `).run();
  return db;
}

function seedDemoAudit(db) {
  const existing = db.prepare("SELECT id FROM audit_programs LIMIT 1").get();
  if (existing) return;

  const seed = db.transaction(() => {
    const auditResult = db.prepare(`
      INSERT INTO audit_programs
        (title, framework, audit_type, objective, scope, criteria, risk_level, lead_auditor, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "DEMO — Integrated AI management system readiness review",
      "ISO/IEC 42001:2023; NIST AI RMF 1.0",
      "Internal readiness assessment",
      "Evaluate the design and implementation of selected AI governance processes against organization-approved criteria.",
      "Illustrative AI inventory, impact assessment, oversight, monitoring, and incident processes.",
      "Organization-approved AI policy; selected ISO/IEC 42001 and NIST AI RMF criteria (references to be confirmed by the audit team).",
      "High",
      "Demo Lead Auditor",
      "2026-11-02",
      "2026-11-16",
      "Planned"
    );
    const auditId = Number(auditResult.lastInsertRowid);
    const insertTest = db.prepare(`
      INSERT INTO audit_tests (audit_id, reference, title, objective, procedure, evidence_expected, result, notes, tested_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTest.run(auditId, "DEMO-TEST-01", "AI inventory completeness", "Determine whether in-scope AI systems are identified and assigned accountable owners.", "Select a sample of in-scope business units; compare submitted use cases with the inventory and follow exceptions to resolution.", "Approved inventory export, intake records, owner confirmations.", "Not tested", "", "");
    insertTest.run(auditId, "DEMO-TEST-02", "Impact assessment review", "Determine whether defined impact review is completed before selected systems enter operation.", "Sample selected use cases; inspect documented context, impact rationale, approval, and recorded mitigations.", "Impact assessments, approval records, deployment decisions.", "Not tested", "", "");
    insertTest.run(auditId, "DEMO-TEST-03", "AI incident response", "Determine whether AI-related incidents are reported, assessed, and routed for response.", "Walk through the incident procedure with responsible personnel and inspect selected records if available.", "Procedure, training/communications, incident records, response evidence.", "Not tested", "", "");
    db.prepare("INSERT INTO audit_events (audit_id, entity_type, entity_id, action, detail) VALUES (?, 'audit', ?, 'created', 'Illustrative seed record; replace with organization data.')").run(auditId, auditId);
  });
  seed();
}

function seedDemoObligations(db) {
  if (db.prepare("SELECT name FROM seed_markers WHERE name = 'regulatory_obligations'").get()) return;
  const seed = db.transaction(() => {
    if (!db.prepare("SELECT id FROM regulatory_obligations LIMIT 1").get()) {
      const insert = db.prepare(`
        INSERT INTO regulatory_obligations
          (title, reference, regulator, issued_date, owner, applicability, due_date, implementation)
        VALUES (@title, @reference, @regulator, @issued_date, @owner, @applicability, @due_date, @implementation)
      `);
      [
        ["Cyber resilience framework", "RBI/2026/114", "RBI", "2026-09-18", "Priya Shah", "Applicable", "2026-10-15", "In progress"],
        ["Quarterly risk disclosures", "SEBI/HO/CFD/2026/08", "SEBI", "2026-09-02", "Arun Patel", "Applicable", "2026-10-22", "Under review"],
        ["Data retention and privacy update", "DPDP/2026/03", "MeitY", "2026-08-12", "Jordan Miller", "Assessing", "2026-11-12", "Not started"],
        ["Vendor review attestation", "POL-TPRM-04", "Internal", "", "Ravi Kumar", "Applicable", "2026-10-29", "In progress"]
      ].forEach(([title, reference, regulator, issued_date, owner, applicability, due_date, implementation]) => {
        insert.run({ title, reference, regulator, issued_date, owner, applicability, due_date, implementation });
      });
    }
    db.prepare("INSERT INTO seed_markers (name) VALUES ('regulatory_obligations')").run();
  });
  seed();
}

function seedDemoGrcRecords(db) {
  const markSeeded = db.prepare("INSERT INTO seed_markers (name) VALUES (?)");
  const seed = db.transaction(() => {
    if (!db.prepare("SELECT name FROM seed_markers WHERE name = 'risks'").get()) {
      if (!db.prepare("SELECT id FROM risks LIMIT 1").get()) {
      const insert = db.prepare(`
        INSERT INTO risks (title, domain, inherent, residual, owner, review_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      [
        ["Third-party data exposure", "Information security", "Critical", "High", "Jordan Miller", "2026-10-18", "Treatment"],
        ["Regulatory reporting delays", "Compliance", "High", "Medium", "Arun Patel", "2026-10-21", "In review"],
        ["Privileged access management", "Technology", "High", "Medium", "Lisa Thomas", "2026-10-25", "Treatment"],
        ["Business continuity readiness", "Operations", "Medium", "Low", "Ravi Kumar", "2026-10-29", "Monitoring"],
        ["Cloud service availability", "Technology", "Medium", "Low", "Jordan Miller", "2026-11-02", "Monitoring"]
      ].forEach(record => insert.run(...record));
      }
      markSeeded.run("risks");
    }
    if (!db.prepare("SELECT name FROM seed_markers WHERE name = 'controls'").get()) {
      if (!db.prepare("SELECT id FROM controls LIMIT 1").get()) {
      const insert = db.prepare(`
        INSERT INTO controls (reference, title, frameworks, owner, frequency, last_test, evidence_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      [
        ["CTRL-IT-042", "Quarterly access recertification", "ISO 27001 · SOC 2", "Jordan Miller", "Quarterly", "2026-10-02", 3, "Effective"],
        ["CTRL-IT-018", "Change management approval", "ISO 27001 · SOC 2", "Lisa Thomas", "Per change", "2026-09-28", 8, "Effective"],
        ["CTRL-TP-011", "Vendor security assessment", "ISO 27001", "Ravi Kumar", "Annual", "2026-09-10", 2, "Needs review"],
        ["CTRL-SEC-029", "Incident response exercise", "SOC 2 · ISO 27001", "Arun Patel", "Annual", "2026-08-16", 1, "Evidence due"],
        ["CTRL-OPS-007", "Backup restoration testing", "ISO 27001", "Jordan Miller", "Quarterly", "2026-10-05", 4, "Effective"]
      ].forEach(record => insert.run(...record));
      }
      markSeeded.run("controls");
    }
    if (!db.prepare("SELECT name FROM seed_markers WHERE name = 'ai_systems'").get()) {
      if (!db.prepare("SELECT id FROM ai_systems LIMIT 1").get()) {
      const insert = db.prepare(`
        INSERT INTO ai_systems (name, provider, purpose, owner, impact, oversight, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      [
        ["Microsoft 365 Copilot", "Microsoft · SaaS", "Employee productivity", "Priya Shah", "Moderate", "Review external content", "In use"],
        ["Customer support assistant", "Azure OpenAI · RAG", "Draft support responses", "Jordan Miller", "High", "Human escalation", "Pilot"],
        ["Invoice anomaly model", "Internal · ML", "Prioritize exceptions", "Arun Patel", "Moderate", "Human decision", "In use"],
        ["HR candidate ranking", "Vendor · SaaS", "Recruitment support", "Lisa Thomas", "High", "Human review", "Impact review"],
        ["Engineering code assistant", "GitHub Copilot · SaaS", "Developer productivity", "Ravi Kumar", "Moderate", "Code review & tests", "In use"],
        ["Knowledge search agent", "Internal · retrieval agent", "Internal knowledge retrieval", "Priya Shah", "Moderate", "Source citation review", "Pilot"],
        ["Demand forecasting model", "Internal · ML", "Inventory planning", "Arun Patel", "Low", "Planner approval", "In use"],
        ["Document classification service", "Third-party · SaaS", "Document routing", "Ravi Kumar", "Moderate", "Sample quality checks", "In use"]
      ].forEach(record => insert.run(...record));
      }
      markSeeded.run("ai_systems");
    }
    if (!db.prepare("SELECT name FROM seed_markers WHERE name = 'ai_risks'").get()) {
      if (!db.prepare("SELECT id FROM ai_risks LIMIT 1").get()) {
      const insert = db.prepare(`
        INSERT INTO ai_risks (title, system, dimension, inherent, treatment, owner, residual, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      [
        ["Inaccurate generated customer guidance", "Support assistant", "Reliability · harm", "High", "Grounding, evaluation set, human escalation", "Jordan Miller", "Medium", "Treatment"],
        ["Unfair outcomes in candidate ranking", "HR ranking", "Fairness · rights", "Critical", "Impact assessment, vendor evidence, decision controls", "Lisa Thomas", "High", "Escalated"],
        ["Sensitive data exposure through prompts", "M365 Copilot", "Privacy · security", "High", "Access controls, DLP, training, prompt safeguards", "Priya Shah", "Medium", "Monitoring"],
        ["Over-reliance on anomaly score", "Invoice model", "Human oversight", "Medium", "Human decision required; monitor overrides", "Arun Patel", "Low", "Accepted"],
        ["Third-party model change / service interruption", "External providers", "Resilience · vendor", "High", "Change notification, fallback, revalidation", "Ravi Kumar", "Medium", "Treatment"]
      ].forEach(record => insert.run(...record));
      }
      markSeeded.run("ai_risks");
    }
  });
  seed();
}

module.exports = { createDatabase };
