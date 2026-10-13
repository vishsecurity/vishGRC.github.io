const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const express = require("express");
const multer = require("multer");
const { createDatabase } = require("./database");

const AUDIT_STATUSES = ["Planned", "In progress", "Reporting", "Closed"];
const AUDIT_TYPES = ["Internal", "External", "Supplier", "Readiness assessment", "Integrated"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];
const TEST_RESULTS = ["Not tested", "Pass", "Fail", "Needs improvement", "Not applicable"];
const FINDING_STATUSES = ["Open", "In progress", "Ready for retest", "Closed", "Risk accepted"];
const OBLIGATION_APPLICABILITY = ["Applicable", "Assessing", "Not applicable"];
const OBLIGATION_IMPLEMENTATION = ["Not started", "Under review", "In progress", "Implemented", "Not applicable"];
const RISK_STATUSES = ["Treatment", "In review", "Monitoring", "Accepted", "Closed"];
const CONTROL_STATUSES = ["Effective", "Needs review", "Evidence due", "Ineffective"];
const AI_IMPACTS = ["Unassessed", "Low", "Moderate", "High", "Critical"];
const AI_SYSTEM_STATUSES = ["Proposed", "Pilot", "In use", "Impact review", "Retired"];
const AI_RISK_STATUSES = ["Treatment", "Escalated", "Monitoring", "Accepted", "Closed"];
const FIELDS = {
  audit: {
    title: { required: true, max: 160 },
    framework: { required: true, max: 240 },
    audit_type: { required: true, values: AUDIT_TYPES },
    objective: { required: true, max: 2000 },
    scope: { required: true, max: 4000 },
    criteria: { required: true, max: 4000 },
    risk_level: { required: true, values: RISK_LEVELS },
    lead_auditor: { required: true, max: 120 },
    team_competence: { max: 2000 },
    independence_notes: { max: 2000 },
    communication_plan: { max: 2000 },
    start_date: { required: true, date: true },
    end_date: { required: true, date: true },
    status: { required: true, values: AUDIT_STATUSES }
  },
  test: {
    reference: { max: 80 },
    title: { required: true, max: 180 },
    objective: { required: true, max: 2000 },
    procedure: { required: true, max: 4000 },
    sampling_method: { max: 2000 },
    evidence_expected: { max: 2000 },
    result: { required: true, values: TEST_RESULTS },
    notes: { max: 4000 },
    tested_by: { max: 120 }
  },
  finding: {
    test_id: { integer: true, nullable: true },
    reference: { max: 80 },
    title: { required: true, max: 180 },
    criteria: { required: true, max: 2000 },
    condition: { required: true, max: 4000 },
    cause: { max: 2000 },
    impact: { max: 2000 },
    severity: { required: true, values: RISK_LEVELS },
    owner: { required: true, max: 120 },
    due_date: { required: true, date: true },
    status: { required: true, values: FINDING_STATUSES },
    corrective_action: { max: 4000 },
    closure_evidence: { max: 4000 }
  },
  obligation: {
    title: { required: true, max: 180 },
    reference: { max: 160 },
    regulator: { required: true, max: 120 },
    issued_date: { date: true },
    owner: { required: true, max: 120 },
    applicability: { required: true, values: OBLIGATION_APPLICABILITY },
    due_date: { required: true, date: true },
    implementation: { required: true, values: OBLIGATION_IMPLEMENTATION }
  },
  risk: {
    title: { required: true, max: 180 },
    domain: { required: true, max: 120 },
    inherent: { required: true, values: RISK_LEVELS },
    residual: { required: true, values: RISK_LEVELS },
    owner: { required: true, max: 120 },
    review_date: { required: true, date: true },
    status: { required: true, values: RISK_STATUSES }
  },
  control: {
    reference: { max: 80 },
    title: { required: true, max: 180 },
    frameworks: { max: 240 },
    owner: { required: true, max: 120 },
    frequency: { max: 80 },
    last_test: { date: true },
    evidence_count: { nonnegativeInteger: true },
    status: { required: true, values: CONTROL_STATUSES }
  },
  aiSystem: {
    name: { required: true, max: 180 },
    provider: { max: 160 },
    purpose: { max: 2000 },
    owner: { required: true, max: 120 },
    impact: { required: true, values: AI_IMPACTS },
    oversight: { max: 1000 },
    status: { required: true, values: AI_SYSTEM_STATUSES }
  },
  aiRisk: {
    title: { required: true, max: 180 },
    system: { max: 120 },
    dimension: { required: true, max: 120 },
    inherent: { required: true, values: RISK_LEVELS },
    treatment: { max: 2000 },
    owner: { required: true, max: 120 },
    residual: { required: true, values: RISK_LEVELS },
    status: { required: true, values: AI_RISK_STATUSES }
  },
  settings: {
    organization_name: { required: true, max: 120 },
    workspace_label: { max: 120 }
  }
};

function validatePayload(payload, schema, { partial = false } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Request body must be a JSON object.";
  }
  const allowed = new Set(Object.keys(schema));
  const unexpected = Object.keys(payload).find(key => !allowed.has(key));
  if (unexpected) return `Unexpected field: ${unexpected}.`;

  for (const [field, rules] of Object.entries(schema)) {
    if (partial && !Object.hasOwn(payload, field)) continue;
    const value = payload[field];
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      if (rules.required && !partial) return `${field} is required.`;
      if (rules.required && partial && value !== undefined) return `${field} cannot be empty.`;
      continue;
    }
    if (rules.integer) {
      if (!Number.isSafeInteger(Number(value)) || Number(value) < 1) return `${field} must be a positive integer.`;
      continue;
    }
    if (rules.nonnegativeInteger) {
      if (!Number.isSafeInteger(Number(value)) || Number(value) < 0) return `${field} must be a non-negative integer.`;
      continue;
    }
    if (typeof value !== "string") return `${field} must be a string.`;
    if (rules.max && value.trim().length > rules.max) return `${field} must be ${rules.max} characters or fewer.`;
    if (rules.values && !rules.values.includes(value)) return `${field} must be one of: ${rules.values.join(", ")}.`;
    if (rules.date && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${field} must use YYYY-MM-DD format.`;
    if (rules.date && (Number.isNaN(Date.parse(`${value}T00:00:00Z`)) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value)) {
      return `${field} must be a valid calendar date.`;
    }
  }
  return null;
}

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [
    key,
    typeof value === "string" ? value.trim() : value === null ? null : Number(value)
  ]));
}

function recordEvent(db, { auditId, entityType, entityId, action, detail = "", actor = "Local prototype user" }) {
  db.prepare(`
    INSERT INTO audit_events (audit_id, entity_type, entity_id, action, detail, actor)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(auditId ?? null, entityType, entityId ?? null, action, detail, actor);
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PASSWORD_MIN_LENGTH = 12;
const UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOADS = new Map([
  [".pdf", ["application/pdf"]],
  [".png", ["image/png"]],
  [".jpg", ["image/jpeg"]],
  [".jpeg", ["image/jpeg"]],
  [".gif", ["image/gif"]],
  [".webp", ["image/webp"]],
  [".doc", ["application/msword"]],
  [".docx", ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]],
  [".xls", ["application/vnd.ms-excel"]],
  [".xlsx", ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]],
  [".ppt", ["application/vnd.ms-powerpoint"]],
  [".pptx", ["application/vnd.openxmlformats-officedocument.presentationml.presentation"]]
]);

function passwordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString("hex")
  };
}

function validPassword(password) {
  return typeof password === "string" && password.length >= PASSWORD_MIN_LENGTH && password.length <= 256;
}

function validEmail(email) {
  return typeof email === "string" && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(user) {
  return { id: user.id, email: user.email, display_name: user.display_name, role: user.role };
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function uploadSignatureMatches(filePath, extension) {
  const bytes = Buffer.alloc(12);
  const descriptor = fs.openSync(filePath, "r");
  try {
    fs.readSync(descriptor, bytes, 0, bytes.length, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  if (extension === ".pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (extension === ".png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (extension === ".jpg" || extension === ".jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === ".gif") return ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString());
  if (extension === ".webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if ([".docx", ".xlsx", ".pptx"].includes(extension)) return bytes[0] === 0x50 && bytes[1] === 0x4b;
  if ([".doc", ".xls", ".ppt"].includes(extension)) return bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return false;
}

function getAudit(db, id) {
  const audit = db.prepare("SELECT * FROM audit_programs WHERE id = ?").get(id);
  if (!audit) return null;
  audit.tests = db.prepare("SELECT * FROM audit_tests WHERE audit_id = ? ORDER BY id").all(id);
  const evidence = db.prepare(`
    SELECT evidence_files.id, evidence_files.test_id, evidence_files.original_name, evidence_files.mime_type,
      evidence_files.size_bytes, evidence_files.created_at, users.display_name AS uploaded_by
    FROM evidence_files JOIN users ON users.id = evidence_files.uploaded_by
    WHERE evidence_files.test_id IN (SELECT id FROM audit_tests WHERE audit_id = ?)
    ORDER BY evidence_files.id
  `).all(id);
  for (const test of audit.tests) test.evidence = evidence.filter(file => file.test_id === test.id);
  audit.findings = db.prepare("SELECT * FROM audit_findings WHERE audit_id = ? ORDER BY id DESC").all(id);
  return audit;
}

function registerCollectionRoutes(app, db, { route, table, schema, entityType, orderBy }) {
  const fields = Object.keys(schema);
  const numericFields = new Set(fields.filter(field => schema[field].nonnegativeInteger));
  app.get(`/api/${route}`, (req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`).all());
  });
  app.get(`/api/${route}/:id`, (req, res) => {
    const record = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(Number(req.params.id));
    if (!record) return res.status(404).json({ error: `${entityType} not found.` });
    res.json(record);
  });
  app.post(`/api/${route}`, (req, res) => {
    const error = validatePayload(req.body, schema);
    if (error) return res.status(400).json({ error });
    const supplied = cleanPayload(req.body);
    const values = Object.fromEntries(fields.map(field => [
      field,
      supplied[field] ?? (numericFields.has(field) ? 0 : "")
    ]));
    const id = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO ${table} (${fields.join(", ")})
        VALUES (${fields.map(field => `@${field}`).join(", ")})
      `).run(values);
      const createdId = Number(result.lastInsertRowid);
      recordEvent(db, { entityType, entityId: createdId, action: "created", detail: `Created ${entityType}: ${values.title ?? values.name}`, actor: req.user.email });
      return createdId;
    })();
    res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
  });
  app.patch(`/api/${route}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const current = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!current) return res.status(404).json({ error: `${entityType} not found.` });
    const error = validatePayload(req.body, schema, { partial: true });
    if (error) return res.status(400).json({ error });
    const supplied = cleanPayload(req.body);
    const fieldsToUpdate = Object.keys(supplied);
    if (fieldsToUpdate.length === 0) return res.status(400).json({ error: "Provide at least one field to update." });
    const values = Object.fromEntries(fieldsToUpdate.map(field => [
      field,
      supplied[field] === null ? (numericFields.has(field) ? 0 : "") : supplied[field]
    ]));
    const assignments = fieldsToUpdate.map(field => `${field} = @${field}`).concat("updated_at = CURRENT_TIMESTAMP");
    db.transaction(() => {
      db.prepare(`UPDATE ${table} SET ${assignments.join(", ")} WHERE id = @id`).run({ ...values, id });
      recordEvent(db, { entityType, entityId: id, action: "updated", detail: `Updated fields: ${fieldsToUpdate.join(", ")}`, actor: req.user.email });
    })();
    res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
  });
  app.delete(`/api/${route}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const current = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id);
    if (!current) return res.status(404).json({ error: `${entityType} not found.` });
    db.transaction(() => {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      recordEvent(db, { entityType, entityId: id, action: "deleted", actor: req.user.email });
    })();
    res.status(204).end();
  });
}

function createApp(db, { bootstrapAdmin, uploadDirectory } = {}) {
  if (db.prepare("SELECT id FROM users LIMIT 1").get() === undefined) {
    const hasBootstrapValues = bootstrapAdmin?.email || bootstrapAdmin?.password || bootstrapAdmin?.displayName;
    if (hasBootstrapValues && (!validEmail(bootstrapAdmin.email) || !validPassword(bootstrapAdmin.password))) {
      throw new Error("Bootstrap credentials require a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
    }
    if (hasBootstrapValues) {
      const credentials = passwordHash(bootstrapAdmin.password);
      db.prepare(`
        INSERT INTO users (email, display_name, password_hash, password_salt, role)
        VALUES (?, ?, ?, ?, 'Admin')
      `).run(
        bootstrapAdmin.email.trim().toLowerCase(),
        String(bootstrapAdmin.displayName || bootstrapAdmin.email).trim().slice(0, 120),
        credentials.hash,
        credentials.salt
      );
    }
  }
  const evidenceDirectory = path.resolve(uploadDirectory || path.join(__dirname, "data", "evidence"));
  fs.mkdirSync(evidenceDirectory, { recursive: true, mode: 0o700 });
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) => callback(null, evidenceDirectory),
      filename: (_req, _file, callback) => callback(null, `${crypto.randomUUID()}.upload`)
    }),
    limits: { fileSize: UPLOAD_LIMIT_BYTES, files: 1 },
    fileFilter: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const mimeTypes = ALLOWED_UPLOADS.get(extension);
      if (!mimeTypes || !mimeTypes.includes(file.mimetype)) {
        callback(new Error("Unsupported file type. Upload PDF, images, or Office documents only."));
        return;
      }
      callback(null, true);
    }
  });
  const app = express();
  app.set("trust proxy", "loopback");
  const loginAttempts = new Map();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
      "Cache-Control": "no-store"
    });
    next();
  });
  app.use(express.json({ limit: "100kb", strict: true }));
  app.param("id", (req, res, next, value) => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Record ID must be a positive integer." });
    req.params.id = String(id);
    next();
  });

  function resolveSession(req) {
    const token = (req.headers.cookie || "").split(";").map(value => value.trim())
      .find(value => value.startsWith("grc_session="))?.slice("grc_session=".length);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const session = db.prepare(`
      SELECT users.id, users.email, users.display_name, users.role, users.active, user_sessions.expires_at
      FROM user_sessions JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token_hash = ?
    `).get(tokenHash(token));
    if (!session || !session.active || Date.parse(`${session.expires_at.replace(" ", "T")}Z`) <= Date.now()) {
      if (session) db.prepare("DELETE FROM user_sessions WHERE token_hash = ?").run(tokenHash(token));
      return null;
    }
    return session;
  }

  app.post("/api/auth/login", (req, res) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = loginAttempts.get(key);
    if (current && current.count >= 5 && current.resetAt > Date.now()) {
      return res.status(429).json({ error: "Too many sign-in attempts. Wait 15 minutes and try again." });
    }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND active = 1").get(email);
    const suppliedHash = passwordHash(password.slice(0, 256), user?.password_salt || "northstar-invalid-user-salt").hash;
    const isValid = validPassword(password) && user &&
      crypto.timingSafeEqual(Buffer.from(user.password_hash, "hex"), Buffer.from(suppliedHash, "hex"));
    if (!isValid) {
      const failed = current?.resetAt > Date.now() ? current : { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
      failed.count += 1;
      loginAttempts.set(key, failed);
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    loginAttempts.delete(key);
    db.prepare("DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP").run();
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString().replace("T", " ").slice(0, 19);
    db.prepare("INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash(token), user.id, expires);
    const secure = req.secure ? "; Secure" : "";
    res.setHeader("Set-Cookie", `grc_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
    res.json({ user: publicUser(user) });
  });

  app.use("/api", (req, res, next) => {
    const origin = req.get("origin");
    if (origin && origin !== `${req.protocol}://${req.get("host")}`) {
      return res.status(403).json({ error: "Cross-origin requests are not allowed." });
    }
    if ((req.method === "GET" && req.path === "/health") ||
        (req.method === "POST" && req.path === "/auth/login")) return next();
    if (req.method === "POST" && req.path === "/auth/setup") {
      const address = req.ip || req.socket.remoteAddress || "";
      const loopback = address === "::1" || address === "127.0.0.1" || address.startsWith("::ffff:127.");
      if (!loopback) return res.status(403).json({ error: "Initial setup is only available from this machine." });
      return next();
    }
    const user = resolveSession(req);
    if (!user) return res.status(401).json({ error: "Sign in to access this workspace." });
    req.user = user;
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) &&
        !(req.method === "POST" && req.path === "/auth/logout") && user.role === "Viewer") {
      return res.status(403).json({ error: "Viewer accounts have read-only access." });
    }
    next();
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok", storage: "SQLite", mode: "local prototype" }));
  app.get("/assets/governanceguard-logo.png", (req, res) => res.sendFile(path.join(__dirname, "assets", "governanceguard-logo.png")));
  app.get("/assets/governanceguard-mark.png", (req, res) => res.sendFile(path.join(__dirname, "assets", "governanceguard-mark.png")));
  app.get("/", (req, res) => {
    const signedIn = resolveSession(req);
    if (signedIn) return res.sendFile(path.join(__dirname, "index.html"));
    const hasUsers = db.prepare("SELECT id FROM users LIMIT 1").get();
    res.sendFile(path.join(__dirname, hasUsers ? "login.html" : "setup.html"));
  });
  app.post("/api/auth/setup", (req, res) => {
    const unexpected = Object.keys(req.body || {}).find(field => !["email", "display_name", "password"].includes(field));
    if (unexpected) return res.status(400).json({ error: `Unexpected field: ${unexpected}.` });
    const { email, display_name, password } = req.body || {};
    if (!validEmail(email) || typeof display_name !== "string" || !display_name.trim() || display_name.trim().length > 120 ||
        !validPassword(password)) {
      return res.status(400).json({ error: "Provide a valid email, display name, and password (12–256 characters)." });
    }
    const credentials = passwordHash(password);
    const result = db.transaction(() => {
      if (db.prepare("SELECT id FROM users LIMIT 1").get()) return null;
      return db.prepare(`
        INSERT INTO users (email, display_name, password_hash, password_salt, role)
        VALUES (?, ?, ?, ?, 'Admin')
      `).run(email.trim().toLowerCase(), display_name.trim(), credentials.hash, credentials.salt);
    })();
    if (!result) return res.status(409).json({ error: "Workspace setup is already complete. Sign in instead." });
    res.status(201).json({ status: "created", next: "Sign in with the administrator account you just created." });
  });
  app.get("/api/auth/session", (req, res) => res.json({ user: publicUser(req.user) }));
  app.post("/api/auth/logout", (req, res) => {
    const token = (req.headers.cookie || "").split(";").map(value => value.trim())
      .find(value => value.startsWith("grc_session="))?.slice("grc_session=".length);
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      db.prepare("DELETE FROM user_sessions WHERE token_hash = ?").run(tokenHash(token));
    }
    const secure = req.secure ? "; Secure" : "";
    res.setHeader("Set-Cookie", `grc_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
    res.status(204).end();
  });

  app.get("/api/users", (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Administrator access is required." });
    res.json(db.prepare("SELECT id, email, display_name, role, active, created_at FROM users ORDER BY id").all());
  });

  app.post("/api/users", (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Administrator access is required." });
    const unexpected = Object.keys(req.body || {}).find(field => !["email", "display_name", "password", "role"].includes(field));
    if (unexpected) return res.status(400).json({ error: `Unexpected field: ${unexpected}.` });
    const { email, display_name, password, role } = req.body || {};
    if (!validEmail(email) || typeof display_name !== "string" || !display_name.trim() || display_name.trim().length > 120 ||
        !validPassword(password) || !["Admin", "Editor", "Viewer"].includes(role)) {
      return res.status(400).json({ error: "Provide a valid email, display name, password (12–256 characters), and role." });
    }
    const credentials = passwordHash(password);
    try {
      const userId = db.transaction(() => {
        const result = db.prepare(`
          INSERT INTO users (email, display_name, password_hash, password_salt, role)
          VALUES (?, ?, ?, ?, ?)
        `).run(email.trim().toLowerCase(), display_name.trim(), credentials.hash, credentials.salt, role);
        const id = Number(result.lastInsertRowid);
        recordEvent(db, { entityType: "user", entityId: id, action: "created", detail: `Created ${role} account.`, actor: req.user.email });
        return id;
      })();
      const created = db.prepare("SELECT id, email, display_name, role, active, created_at FROM users WHERE id = ?").get(userId);
      res.status(201).json(created);
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "An account with that email already exists." });
      throw error;
    }
  });

  app.patch("/api/users/:id", (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Administrator access is required." });
    const unexpected = Object.keys(req.body || {}).find(field => !["role", "active", "display_name"].includes(field));
    if (unexpected) return res.status(400).json({ error: `Unexpected field: ${unexpected}.` });
    const target = db.prepare("SELECT id, role, active FROM users WHERE id = ?").get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: "User not found." });
    const { role, active, display_name } = req.body || {};
    const fields = [];
    const values = {};
    if (role !== undefined) {
      if (!["Admin", "Editor", "Viewer"].includes(role)) return res.status(400).json({ error: "Role must be Admin, Editor, or Viewer." });
      fields.push("role = @role");
      values.role = role;
    }
    if (active !== undefined) {
      if (typeof active !== "boolean") return res.status(400).json({ error: "active must be a boolean." });
      fields.push("active = @active");
      values.active = active ? 1 : 0;
    }
    if (display_name !== undefined) {
      if (typeof display_name !== "string" || !display_name.trim() || display_name.trim().length > 120) {
        return res.status(400).json({ error: "display_name must contain 1–120 characters." });
      }
      fields.push("display_name = @display_name");
      values.display_name = display_name.trim();
    }
    if (!fields.length) return res.status(400).json({ error: "Provide a role, active state, or display name to update." });
    const nextRole = values.role || target.role;
    const nextActive = values.active === undefined ? target.active : values.active;
    if (target.id === req.user.id && (!nextActive || nextRole !== "Admin")) {
      return res.status(400).json({ error: "You cannot deactivate or demote your own administrator account." });
    }
    if (target.role === "Admin" && target.active && (nextRole !== "Admin" || !nextActive)) {
      const admins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'Admin' AND active = 1").get().count;
      if (admins <= 1) return res.status(400).json({ error: "At least one active administrator must remain." });
    }
    db.transaction(() => {
      db.prepare(`UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ ...values, id: target.id });
      if (!nextActive) db.prepare("DELETE FROM user_sessions WHERE user_id = ?").run(target.id);
      recordEvent(db, { entityType: "user", entityId: target.id, action: "updated", detail: `Updated fields: ${Object.keys(values).join(", ")}`, actor: req.user.email });
    })();
    res.json(db.prepare("SELECT id, email, display_name, role, active, created_at FROM users WHERE id = ?").get(target.id));
  });

  app.post("/api/users/:id/password", (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Administrator access is required." });
    const unexpected = Object.keys(req.body || {}).find(field => field !== "password");
    if (unexpected) return res.status(400).json({ error: `Unexpected field: ${unexpected}.` });
    const userId = Number(req.params.id);
    if (!db.prepare("SELECT id FROM users WHERE id = ?").get(userId)) return res.status(404).json({ error: "User not found." });
    if (!validPassword(req.body?.password)) return res.status(400).json({ error: "Password must be 12–256 characters." });
    const credentials = passwordHash(req.body.password);
    db.transaction(() => {
      db.prepare("UPDATE users SET password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(credentials.hash, credentials.salt, userId);
      db.prepare("DELETE FROM user_sessions WHERE user_id = ?").run(userId);
      recordEvent(db, { entityType: "user", entityId: userId, action: "password_reset", actor: req.user.email });
    })();
    res.status(204).end();
  });

  app.get("/api/tests/:id/evidence", (req, res) => {
    const test = db.prepare("SELECT id FROM audit_tests WHERE id = ?").get(Number(req.params.id));
    if (!test) return res.status(404).json({ error: "Audit test not found." });
    res.json(db.prepare(`
      SELECT evidence_files.id, evidence_files.original_name, evidence_files.mime_type,
        evidence_files.size_bytes, evidence_files.created_at, users.display_name AS uploaded_by
      FROM evidence_files JOIN users ON users.id = evidence_files.uploaded_by
      WHERE evidence_files.test_id = ? ORDER BY evidence_files.id
    `).all(test.id));
  });

  app.post("/api/tests/:id/evidence", (req, res, next) => {
    const test = db.prepare("SELECT id, audit_id FROM audit_tests WHERE id = ?").get(Number(req.params.id));
    if (!test) return res.status(404).json({ error: "Audit test not found." });
    req.evidenceTest = test;
    next();
  }, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Choose a file to upload." });
    fs.chmodSync(req.file.path, 0o600);
    const extension = path.extname(req.file.originalname).toLowerCase();
    if (!uploadSignatureMatches(req.file.path, extension)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "File contents do not match the selected file type." });
    }
    const originalName = path.win32.basename(path.basename(req.file.originalname))
      .replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 240);
    if (!originalName) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "The uploaded file name is invalid." });
    }
    const storageName = `${path.basename(req.file.filename, ".upload")}${extension}`;
    const storedPath = path.join(evidenceDirectory, storageName);
    try {
      fs.renameSync(req.file.path, storedPath);
      const id = db.transaction(() => {
        const result = db.prepare(`
          INSERT INTO evidence_files (test_id, original_name, storage_name, mime_type, size_bytes, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(req.evidenceTest.id, originalName, storageName, req.file.mimetype, req.file.size, req.user.id);
        recordEvent(db, {
          auditId: req.evidenceTest.audit_id, entityType: "evidence", entityId: Number(result.lastInsertRowid),
          action: "uploaded", detail: `Uploaded evidence file: ${originalName}`, actor: req.user.email
        });
        return Number(result.lastInsertRowid);
      })();
      res.status(201).json(db.prepare(`
        SELECT evidence_files.id, evidence_files.original_name, evidence_files.mime_type,
          evidence_files.size_bytes, evidence_files.created_at, users.display_name AS uploaded_by
        FROM evidence_files JOIN users ON users.id = evidence_files.uploaded_by
        WHERE evidence_files.id = ?
      `).get(id));
    } catch (error) {
      if (fs.existsSync(storedPath)) fs.unlinkSync(storedPath);
      throw error;
    }
  });

  app.get("/api/evidence/:id/download", (req, res) => {
    const file = db.prepare("SELECT * FROM evidence_files WHERE id = ?").get(Number(req.params.id));
    if (!file) return res.status(404).json({ error: "Evidence file not found." });
    const storedPath = path.join(evidenceDirectory, file.storage_name);
    if (!fs.existsSync(storedPath)) return res.status(404).json({ error: "Evidence file is missing from storage." });
    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.download(storedPath, file.original_name);
  });

  app.delete("/api/evidence/:id", (req, res) => {
    const file = db.prepare(`
      SELECT evidence_files.*, audit_tests.audit_id
      FROM evidence_files JOIN audit_tests ON audit_tests.id = evidence_files.test_id
      WHERE evidence_files.id = ?
    `).get(Number(req.params.id));
    if (!file) return res.status(404).json({ error: "Evidence file not found." });
    db.transaction(() => {
      db.prepare("DELETE FROM evidence_files WHERE id = ?").run(file.id);
      recordEvent(db, {
        auditId: file.audit_id, entityType: "evidence", entityId: file.id,
        action: "deleted", detail: `Deleted evidence file: ${file.original_name}`, actor: req.user.email
      });
    })();
    const storedPath = path.join(evidenceDirectory, file.storage_name);
    if (fs.existsSync(storedPath)) fs.unlinkSync(storedPath);
    res.status(204).end();
  });

  app.get("/api/settings", (req, res) => {
    res.json(db.prepare("SELECT organization_name, workspace_label, updated_at FROM workspace_settings WHERE id = 1").get());
  });

  app.patch("/api/settings", (req, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Administrator access is required to change workspace settings." });
    const error = validatePayload(req.body, FIELDS.settings, { partial: true });
    if (error) return res.status(400).json({ error });
    const supplied = cleanPayload(req.body);
    const fields = Object.keys(supplied);
    if (fields.length === 0) return res.status(400).json({ error: "Provide at least one field to update." });
    const values = Object.fromEntries(Object.entries(supplied).map(([field, value]) => [field, value ?? ""]));
    const assignments = fields.map(field => `${field} = @${field}`).concat("updated_at = CURRENT_TIMESTAMP");
    db.transaction(() => {
      db.prepare(`UPDATE workspace_settings SET ${assignments.join(", ")} WHERE id = 1`).run(values);
      recordEvent(db, { entityType: "workspace_settings", entityId: 1, action: "updated", detail: `Updated fields: ${fields.join(", ")}`, actor: req.user.email });
    })();
    res.json(db.prepare("SELECT organization_name, workspace_label, updated_at FROM workspace_settings WHERE id = 1").get());
  });

  app.get("/api/audits", (req, res) => {
    const audits = db.prepare("SELECT id FROM audit_programs ORDER BY start_date DESC, id DESC").all();
    res.json(audits.map(({ id }) => getAudit(db, id)));
  });

  app.get("/api/regulatory-obligations", (req, res) => {
    res.json(db.prepare("SELECT * FROM regulatory_obligations ORDER BY due_date, id").all());
  });

  app.post("/api/regulatory-obligations", (req, res) => {
    const error = validatePayload(req.body, FIELDS.obligation);
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    const obligationId = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO regulatory_obligations
          (title, reference, regulator, issued_date, owner, applicability, due_date, implementation)
        VALUES (@title, @reference, @regulator, @issued_date, @owner, @applicability, @due_date, @implementation)
      `).run({
        ...values,
        reference: values.reference ?? "",
        issued_date: values.issued_date ?? ""
      });
      const id = Number(result.lastInsertRowid);
      recordEvent(db, {
        entityType: "regulatory_obligation",
        entityId: id,
        action: "created",
        detail: `Created obligation: ${values.title}`,
        actor: req.user.email
      });
      return id;
    })();
    res.status(201).json(db.prepare("SELECT * FROM regulatory_obligations WHERE id = ?").get(obligationId));
  });

  app.patch("/api/regulatory-obligations/:id", (req, res) => {
    const obligationId = Number(req.params.id);
    const current = db.prepare("SELECT * FROM regulatory_obligations WHERE id = ?").get(obligationId);
    if (!current) return res.status(404).json({ error: "Regulatory obligation not found." });
    const error = validatePayload(req.body, FIELDS.obligation, { partial: true });
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    const fields = Object.keys(values);
    if (fields.length === 0) return res.status(400).json({ error: "Provide at least one field to update." });
    const assignments = fields.map(field => `${field} = @${field}`).concat("updated_at = CURRENT_TIMESTAMP");
    const updateValues = Object.fromEntries(Object.entries(values).map(([field, value]) => [
      field,
      value === null && (field === "reference" || field === "issued_date") ? "" : value
    ]));
    db.transaction(() => {
      db.prepare(`UPDATE regulatory_obligations SET ${assignments.join(", ")} WHERE id = @id`).run({ ...updateValues, id: obligationId });
      recordEvent(db, {
        entityType: "regulatory_obligation",
        entityId: obligationId,
        action: "updated",
        detail: `Updated fields: ${fields.join(", ")}`,
        actor: req.user.email
      });
    })();
    res.json(db.prepare("SELECT * FROM regulatory_obligations WHERE id = ?").get(obligationId));
  });

  app.delete("/api/regulatory-obligations/:id", (req, res) => {
    const obligationId = Number(req.params.id);
    const current = db.prepare("SELECT id FROM regulatory_obligations WHERE id = ?").get(obligationId);
    if (!current) return res.status(404).json({ error: "Regulatory obligation not found." });
    db.transaction(() => {
      db.prepare("DELETE FROM regulatory_obligations WHERE id = ?").run(obligationId);
      recordEvent(db, { entityType: "regulatory_obligation", entityId: obligationId, action: "deleted", actor: req.user.email });
    })();
    res.status(204).end();
  });

  [
    { route: "risks", table: "risks", schema: FIELDS.risk, entityType: "risk", orderBy: "review_date, id" },
    { route: "controls", table: "controls", schema: FIELDS.control, entityType: "control", orderBy: "id" },
    { route: "ai-systems", table: "ai_systems", schema: FIELDS.aiSystem, entityType: "ai_system", orderBy: "id" },
    { route: "ai-risks", table: "ai_risks", schema: FIELDS.aiRisk, entityType: "ai_risk", orderBy: "id" }
  ].forEach(collection => registerCollectionRoutes(app, db, collection));

  app.post("/api/audits", (req, res) => {
    const error = validatePayload(req.body, FIELDS.audit);
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    if (values.end_date < values.start_date) return res.status(400).json({ error: "end_date cannot be before start_date." });
    const id = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO audit_programs
          (title, framework, audit_type, objective, scope, criteria, risk_level, lead_auditor, team_competence, independence_notes, communication_plan, start_date, end_date, status)
        VALUES (@title, @framework, @audit_type, @objective, @scope, @criteria, @risk_level, @lead_auditor, @team_competence, @independence_notes, @communication_plan, @start_date, @end_date, @status)
      `).run({
        ...values,
        team_competence: values.team_competence ?? "",
        independence_notes: values.independence_notes ?? "",
        communication_plan: values.communication_plan ?? ""
      });
      const createdId = Number(result.lastInsertRowid);
      recordEvent(db, { auditId: createdId, entityType: "audit", entityId: createdId, action: "created", detail: `Created audit plan: ${values.title}`, actor: req.user.email });
      return createdId;
    })();
    res.status(201).json(getAudit(db, id));
  });

  app.get("/api/audits/:id", (req, res) => {
    const audit = getAudit(db, Number(req.params.id));
    if (!audit) return res.status(404).json({ error: "Audit plan not found." });
    res.json(audit);
  });

  app.patch("/api/audits/:id", (req, res) => {
    const auditId = Number(req.params.id);
    const current = getAudit(db, auditId);
    if (!current) return res.status(404).json({ error: "Audit plan not found." });
    const error = validatePayload(req.body, FIELDS.audit, { partial: true });
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    const startDate = values.start_date ?? current.start_date;
    const endDate = values.end_date ?? current.end_date;
    if (endDate < startDate) return res.status(400).json({ error: "end_date cannot be before start_date." });
    const fields = Object.keys(values);
    if (fields.length === 0) return res.status(400).json({ error: "Provide at least one field to update." });
    const assignments = fields.map(field => `${field} = @${field}`).concat("updated_at = CURRENT_TIMESTAMP");
    db.transaction(() => {
      db.prepare(`UPDATE audit_programs SET ${assignments.join(", ")} WHERE id = @id`).run({ ...values, id: auditId });
      recordEvent(db, { auditId, entityType: "audit", entityId: auditId, action: "updated", detail: `Updated fields: ${fields.join(", ")}`, actor: req.user.email });
    })();
    res.json(getAudit(db, auditId));
  });

  app.post("/api/audits/:id/tests", (req, res) => {
    const auditId = Number(req.params.id);
    if (!getAudit(db, auditId)) return res.status(404).json({ error: "Audit plan not found." });
    const error = validatePayload(req.body, FIELDS.test);
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    const testId = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO audit_tests (audit_id, reference, title, objective, procedure, sampling_method, evidence_expected, result, notes, tested_by, tested_at)
        VALUES (@audit_id, @reference, @title, @objective, @procedure, @sampling_method, @evidence_expected, @result, @notes, @tested_by,
          CASE WHEN @result IN ('Pass', 'Fail', 'Needs improvement', 'Not applicable') THEN CURRENT_TIMESTAMP ELSE NULL END)
      `).run({
        audit_id: auditId,
        reference: values.reference ?? "",
        title: values.title,
        objective: values.objective,
        procedure: values.procedure,
        sampling_method: values.sampling_method ?? "",
        evidence_expected: values.evidence_expected ?? "",
        result: values.result,
        notes: values.notes ?? "",
        tested_by: values.tested_by ?? ""
      });
      const createdId = Number(result.lastInsertRowid);
      recordEvent(db, { auditId, entityType: "test", entityId: createdId, action: "created", detail: `Created workpaper: ${values.title}`, actor: req.user.email });
      return createdId;
    })();
    res.status(201).json(db.prepare("SELECT * FROM audit_tests WHERE id = ?").get(testId));
  });

  app.patch("/api/tests/:id", (req, res) => {
    const testId = Number(req.params.id);
    const current = db.prepare("SELECT * FROM audit_tests WHERE id = ?").get(testId);
    if (!current) return res.status(404).json({ error: "Audit test not found." });
    const schema = { result: FIELDS.test.result, notes: FIELDS.test.notes, tested_by: FIELDS.test.tested_by };
    const error = validatePayload(req.body, schema, { partial: true });
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    const fields = Object.keys(values);
    if (fields.length === 0) return res.status(400).json({ error: "Provide at least one field to update." });
    const assignments = fields.map(field => `${field} = @${field}`).concat(
      "tested_at = CASE WHEN @has_result = 1 AND @result != 'Not tested' THEN CURRENT_TIMESTAMP WHEN @has_result = 1 THEN NULL ELSE tested_at END",
      "updated_at = CURRENT_TIMESTAMP"
    );
    db.transaction(() => {
      db.prepare(`UPDATE audit_tests SET ${assignments.join(", ")} WHERE id = @id`).run({
        ...values,
        id: testId,
        has_result: Object.hasOwn(values, "result") ? 1 : 0,
        result: values.result ?? current.result
      });
      recordEvent(db, { auditId: current.audit_id, entityType: "test", entityId: testId, action: "updated", detail: `Updated fields: ${fields.join(", ")}`, actor: req.user.email });
    })();
    res.json(db.prepare("SELECT * FROM audit_tests WHERE id = ?").get(testId));
  });

  app.post("/api/audits/:id/findings", (req, res) => {
    const auditId = Number(req.params.id);
    if (!getAudit(db, auditId)) return res.status(404).json({ error: "Audit plan not found." });
    const error = validatePayload(req.body, FIELDS.finding);
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    if (values.test_id !== undefined && values.test_id !== null) {
      const linkedTest = db.prepare("SELECT id, result FROM audit_tests WHERE id = ? AND audit_id = ?").get(values.test_id, auditId);
      if (!linkedTest) return res.status(400).json({ error: "test_id must identify a workpaper in this audit." });
      if (!["Fail", "Needs improvement"].includes(linkedTest.result)) {
        return res.status(400).json({ error: "A finding linked to a workpaper requires a recorded Fail or Needs improvement result." });
      }
    }
    const findingId = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO audit_findings
          (audit_id, test_id, reference, title, criteria, condition, cause, impact, severity, owner, due_date, status, corrective_action, closure_evidence)
        VALUES (@audit_id, @test_id, @reference, @title, @criteria, @condition, @cause, @impact, @severity, @owner, @due_date, @status, @corrective_action, @closure_evidence)
      `).run({
        audit_id: auditId,
        test_id: values.test_id ?? null,
        reference: values.reference ?? "",
        title: values.title,
        criteria: values.criteria,
        condition: values.condition,
        cause: values.cause ?? "",
        impact: values.impact ?? "",
        severity: values.severity,
        owner: values.owner,
        due_date: values.due_date,
        status: values.status,
        corrective_action: values.corrective_action ?? "",
        closure_evidence: values.closure_evidence ?? ""
      });
      const createdId = Number(result.lastInsertRowid);
      recordEvent(db, { auditId, entityType: "finding", entityId: createdId, action: "created", detail: `Created finding: ${values.title}`, actor: req.user.email });
      return createdId;
    })();
    res.status(201).json(db.prepare("SELECT * FROM audit_findings WHERE id = ?").get(findingId));
  });

  app.patch("/api/findings/:id", (req, res) => {
    const findingId = Number(req.params.id);
    const current = db.prepare("SELECT * FROM audit_findings WHERE id = ?").get(findingId);
    if (!current) return res.status(404).json({ error: "Audit finding not found." });
    const error = validatePayload(req.body, FIELDS.finding, { partial: true });
    if (error) return res.status(400).json({ error });
    const values = cleanPayload(req.body);
    if (Object.hasOwn(values, "test_id") && values.test_id !== null) {
      const linkedTest = db.prepare("SELECT id, result FROM audit_tests WHERE id = ? AND audit_id = ?").get(values.test_id, current.audit_id);
      if (!linkedTest) return res.status(400).json({ error: "test_id must identify a workpaper in this audit." });
      if (!["Fail", "Needs improvement"].includes(linkedTest.result)) {
        return res.status(400).json({ error: "A finding linked to a workpaper requires a recorded Fail or Needs improvement result." });
      }
    }
    const nextStatus = values.status ?? current.status;
    const closureEvidence = values.closure_evidence ?? current.closure_evidence;
    if (nextStatus === "Closed" && (!closureEvidence || !closureEvidence.trim())) {
      return res.status(400).json({ error: "closure_evidence is required before closing a finding." });
    }
    const impact = values.impact ?? current.impact;
    if (nextStatus === "Risk accepted" && (!impact || !impact.trim())) {
      return res.status(400).json({ error: "impact must record the rationale for accepting the risk." });
    }
    const fields = Object.keys(values);
    if (fields.length === 0) return res.status(400).json({ error: "Provide at least one field to update." });
    const assignments = fields.map(field => `${field} = @${field}`).concat("updated_at = CURRENT_TIMESTAMP");
    db.transaction(() => {
      db.prepare(`UPDATE audit_findings SET ${assignments.join(", ")} WHERE id = @id`).run({ ...values, id: findingId });
      recordEvent(db, { auditId: current.audit_id, entityType: "finding", entityId: findingId, action: "updated", detail: `Updated fields: ${fields.join(", ")}`, actor: req.user.email });
    })();
    res.json(db.prepare("SELECT * FROM audit_findings WHERE id = ?").get(findingId));
  });

  app.get("/api/audits/:id/events", (req, res) => {
    const auditId = Number(req.params.id);
    if (!getAudit(db, auditId)) return res.status(404).json({ error: "Audit plan not found." });
    res.json(db.prepare("SELECT * FROM audit_events WHERE audit_id = ? ORDER BY id DESC LIMIT 250").all(auditId));
  });

  app.use("/api", (req, res) => res.status(404).json({ error: "API route not found." }));
  app.use((req, res) => res.status(404).json({ error: "Resource not found." }));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ error: "Request body contains invalid JSON." });
    if (err instanceof multer.MulterError) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      const message = err.code === "LIMIT_FILE_SIZE"
        ? "Files must be 10 MB or smaller."
        : "Upload exactly one file at a time.";
      return res.status(status).json({ error: message });
    }
    if (err.message.startsWith("Unsupported file type.")) return res.status(400).json({ error: err.message });
    console.error("Request failed:", err.message);
    res.status(500).json({ error: "The request could not be completed." });
  });
  return app;
}

if (require.main === module) {
  const dbPath = process.env.GRC_DB_PATH || path.join(__dirname, "data", "grc.sqlite");
  const db = createDatabase(dbPath);
  const app = createApp(db, {
    bootstrapAdmin: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      displayName: process.env.ADMIN_NAME
    },
    uploadDirectory: process.env.GRC_EVIDENCE_PATH
  });
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "127.0.0.1";
  app.listen(port, host, () => {
    console.log(`GRC audit workbench running at http://${host}:${port}`);
    console.log(`SQLite database: ${dbPath}`);
  });
}

module.exports = { createApp, validatePayload };
