const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createDatabase } = require("../database");
const { createApp } = require("../server");

test("new workspaces allow one-time browser setup for the first administrator", async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "northstar-grc-bootstrap-test-"));
  const db = createDatabase(path.join(directory, "bootstrap.sqlite"));
  const server = createApp(db, { uploadDirectory: path.join(directory, "evidence") }).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    db.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const setupPage = await fetch(baseUrl);
  assert.match(await setupPage.text(), /id="setup-form"/);
  const logo = await fetch(`${baseUrl}/assets/governanceguard-logo.png`);
  assert.equal(logo.status, 200);
  assert.match(logo.headers.get("content-type"), /image\/png/);
  const remoteSetup = await fetch(`${baseUrl}/api/auth/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "governanceguard.example.test",
      Origin: "https://governanceguard.example.test",
      "X-Forwarded-For": "203.0.113.15",
      "X-Forwarded-Proto": "https"
    },
    body: JSON.stringify({
      email: "remote-admin@example.test",
      display_name: "Remote Admin",
      password: "Strong-Remote-Admin-123"
    })
  });
  assert.equal(remoteSetup.status, 403);
  const setup = await fetch(`${baseUrl}/api/auth/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "first-admin@example.test",
      display_name: "First Admin",
      password: "Strong-First-Admin-123"
    })
  });
  assert.equal(setup.status, 201);
  const secondSetup = await fetch(`${baseUrl}/api/auth/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "second-admin@example.test",
      display_name: "Second Admin",
      password: "Strong-Second-Admin-123"
    })
  });
  assert.equal(secondSetup.status, 409);
  const loginPage = await fetch(baseUrl);
  assert.match(await loginPage.text(), /id="login-form"/);
});

test("audit API persists plans, tests, findings, and event history", async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "northstar-grc-test-"));
  const dbPath = path.join(directory, "audit.sqlite");
  let db = createDatabase(dbPath);
  const appOptions = {
    bootstrapAdmin: { email: "admin@example.test", password: "Strong-Test-Pass-123", displayName: "Test Admin" },
    uploadDirectory: path.join(directory, "evidence")
  };
  let server = createApp(db, appOptions).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  let baseUrl = `http://127.0.0.1:${server.address().port}`;
  let sessionCookie = "";
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    db.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  async function api(route, options = {}) {
    const response = await fetch(`${baseUrl}${route}`, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...options.headers
      }
    });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { response, body };
  }

  const health = await api("/api/health");
  assert.equal(health.body.status, "ok");
  assert.equal(health.body.storage, "SQLite");
  assert.equal((await api("/api/settings")).response.status, 401);
  const signInPage = await api("/");
  assert.equal(signInPage.response.status, 200);
  assert.match(signInPage.body, /id="login-form"/);
  const invalidLogin = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@example.test", password: "incorrect-password" })
  });
  assert.equal(invalidLogin.response.status, 401);
  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "ADMIN@example.test", password: "Strong-Test-Pass-123" }),
    headers: {
      Host: "governanceguard.example.test",
      Origin: "https://governanceguard.example.test",
      "X-Forwarded-Proto": "https"
    }
  });
  assert.equal(login.response.status, 200);
  assert.match(login.response.headers.get("set-cookie"), /; Secure(?:;|$)/);
  sessionCookie = login.response.headers.get("set-cookie").split(";")[0];
  assert.equal(login.body.user.role, "Admin");
  assert.equal((await api("/api/auth/session")).body.user.display_name, "Test Admin");
  const initialSettings = await api("/api/settings");
  assert.equal(initialSettings.body.organization_name, "Governance Guard");
  const updatedSettings = await api("/api/settings", {
    method: "PATCH",
    body: JSON.stringify({ organization_name: "Northstar Test Org", workspace_label: "Test workspace" })
  });
  assert.equal(updatedSettings.body.organization_name, "Northstar Test Org");
  assert.equal(updatedSettings.body.workspace_label, "Test workspace");
  const homepage = await api("/");
  assert.equal(homepage.response.status, 200);
  assert.match(homepage.response.headers.get("content-type"), /text\/html/);
  assert.match(homepage.body, /id="obligation-form"/);
  assert.match(homepage.body, /id="obligation-rows"/);
  assert.match(homepage.body, /Made by Vishal Chaudhary/);
  assert.match(homepage.body, /governanceguard-mark\.png/);
  assert.match(homepage.body, /id="view-help"/);
  assert.match(homepage.body, /What you can do/);
  assert.match(homepage.body, /Project files: what each one does/);
  assert.match(homepage.body, /data\/grc\.sqlite/);
  const createdViewer = await api("/api/users", {
    method: "POST",
    body: JSON.stringify({
      email: "viewer@example.test", display_name: "Read Only User",
      password: "Strong-Viewer-Pass-123", role: "Viewer"
    })
  });
  assert.equal(createdViewer.response.status, 201);
  assert.equal(createdViewer.body.role, "Viewer");
  const unknownUserField = await api("/api/users", {
    method: "POST",
    body: JSON.stringify({
      email: "other@example.test", display_name: "Other",
      password: "Strong-Viewer-Pass-123", role: "Viewer", is_admin: true
    })
  });
  assert.equal(unknownUserField.response.status, 400);
  const selfDemotion = await api(`/api/users/${login.body.user.id}`, {
    method: "PATCH",
    body: JSON.stringify({ role: "Editor" })
  });
  assert.equal(selfDemotion.response.status, 400);
  const duplicateUser = await api("/api/users", {
    method: "POST",
    body: JSON.stringify({
      email: "VIEWER@example.test", display_name: "Duplicate",
      password: "Strong-Viewer-Pass-123", role: "Viewer"
    })
  });
  assert.equal(duplicateUser.response.status, 409);
  const adminCookie = sessionCookie;
  const viewerLogin = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "viewer@example.test", password: "Strong-Viewer-Pass-123" })
  });
  assert.equal(viewerLogin.response.status, 200);
  sessionCookie = viewerLogin.response.headers.get("set-cookie").split(";")[0];
  const viewerCookie = sessionCookie;
  assert.equal((await api("/api/risks")).response.status, 200);
  const viewerMutation = await api("/api/risks", {
    method: "POST",
    body: JSON.stringify({
      title: "Viewer cannot write", domain: "Test", inherent: "Low", residual: "Low",
      owner: "Viewer", review_date: "2026-12-01", status: "Treatment"
    })
  });
  assert.equal(viewerMutation.response.status, 403);
  assert.equal((await api("/api/auth/logout", { method: "POST" })).response.status, 204);
  sessionCookie = adminCookie;
  const deactivatedViewer = await api(`/api/users/${createdViewer.body.id}`, {
    method: "PATCH",
    body: JSON.stringify({ active: false })
  });
  assert.equal(deactivatedViewer.response.status, 200);
  sessionCookie = viewerCookie;
  assert.equal((await api("/api/risks")).response.status, 401);
  sessionCookie = adminCookie;
  const sourceFile = await api("/server.js");
  assert.equal(sourceFile.response.status, 404);
  const invalidId = await api("/api/audits/not-a-number");
  assert.equal(invalidId.response.status, 400);

  const seededObligations = await api("/api/regulatory-obligations");
  assert.equal(seededObligations.response.status, 200);
  assert.equal(seededObligations.body.length, 4);
  assert.equal(seededObligations.body[0].title, "Cyber resilience framework");

  const invalidObligation = await api("/api/regulatory-obligations", {
    method: "POST",
    body: JSON.stringify({
      title: "Invalid obligation", regulator: "Example", owner: "Owner",
      applicability: "Maybe", due_date: "2026-02-31", implementation: "Not started"
    })
  });
  assert.equal(invalidObligation.response.status, 400);
  assert.match(invalidObligation.body.error, /applicability must be one of/);
  const invalidObligationDate = await api("/api/regulatory-obligations", {
    method: "POST",
    body: JSON.stringify({
      title: "Invalid issue date", regulator: "Example", owner: "Owner",
      applicability: "Applicable", issued_date: "2026-02-31",
      due_date: "2026-12-01", implementation: "Not started"
    })
  });
  assert.equal(invalidObligationDate.response.status, 400);
  assert.match(invalidObligationDate.body.error, /issued_date must be a valid calendar date/);

  const createdObligation = await api("/api/regulatory-obligations", {
    method: "POST",
    body: JSON.stringify({
      title: "Quarterly resilience return", reference: "REG/2026/42",
      regulator: "Example regulator", issued_date: "2026-09-20",
      owner: "Compliance owner", applicability: "Applicable",
      due_date: "2026-12-01", implementation: "Under review"
    })
  });
  assert.equal(createdObligation.response.status, 201);
  const obligationId = createdObligation.body.id;
  assert.equal(createdObligation.body.reference, "REG/2026/42");

  const updatedObligation = await api(`/api/regulatory-obligations/${obligationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      owner: "Updated compliance owner",
      applicability: "Assessing",
      implementation: "In progress"
    })
  });
  assert.equal(updatedObligation.response.status, 200);
  assert.equal(updatedObligation.body.owner, "Updated compliance owner");
  assert.equal(updatedObligation.body.applicability, "Assessing");
  assert.equal(updatedObligation.body.implementation, "In progress");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM audit_events WHERE entity_type = 'regulatory_obligation' AND entity_id = ?").get(obligationId).count, 2);
  const temporaryObligation = await api("/api/regulatory-obligations", {
    method: "POST",
    body: JSON.stringify({
      title: "Temporary obligation", regulator: "Example", owner: "Owner",
      applicability: "Assessing", due_date: "2026-12-15", implementation: "Not started"
    })
  });
  const deletedObligation = await api(`/api/regulatory-obligations/${temporaryObligation.body.id}`, { method: "DELETE" });
  assert.equal(deletedObligation.response.status, 204);
  const unknownObligation = await api(`/api/regulatory-obligations/${obligationId}`, {
    method: "PATCH",
    body: JSON.stringify({ unexpected: "field" })
  });
  assert.equal(unknownObligation.response.status, 400);

  const seededRisks = await api("/api/risks");
  const seededControls = await api("/api/controls");
  const seededSystems = await api("/api/ai-systems");
  const seededAiRisks = await api("/api/ai-risks");
  assert.equal(seededRisks.body.length, 5);
  assert.equal(seededControls.body.length, 5);
  assert.equal(seededSystems.body.length, 8);
  assert.equal(seededAiRisks.body.length, 5);

  const createdRisk = await api("/api/risks", {
    method: "POST",
    body: JSON.stringify({
      title: "Test risk", domain: "Operations", inherent: "High",
      residual: "Medium", owner: "Risk owner", review_date: "2026-12-15", status: "Treatment"
    })
  });
  assert.equal(createdRisk.response.status, 201);
  const riskId = createdRisk.body.id;
  const updatedRisk = await api(`/api/risks/${riskId}`, {
    method: "PATCH",
    body: JSON.stringify({ owner: "Updated risk owner", residual: "Low" })
  });
  assert.equal(updatedRisk.body.owner, "Updated risk owner");
  assert.equal(updatedRisk.body.residual, "Low");

  const createdControl = await api("/api/controls", {
    method: "POST",
    body: JSON.stringify({
      reference: "CTRL-TEST-01", title: "Test control", frameworks: "Internal",
      owner: "Control owner", frequency: "Annual", last_test: "",
      evidence_count: "0", status: "Needs review"
    })
  });
  assert.equal(createdControl.response.status, 201);
  assert.equal(createdControl.body.evidence_count, 0);
  const updatedControl = await api(`/api/controls/${createdControl.body.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Effective", evidence_count: "2" })
  });
  assert.equal(updatedControl.body.status, "Effective");
  assert.equal(updatedControl.body.evidence_count, 2);
  const deletedControl = await api(`/api/controls/${createdControl.body.id}`, { method: "DELETE" });
  assert.equal(deletedControl.response.status, 204);
  assert.equal((await api(`/api/controls/${createdControl.body.id}`)).response.status, 404);

  const createdSystem = await api("/api/ai-systems", {
    method: "POST",
    body: JSON.stringify({
      name: "Test AI system", provider: "Internal", purpose: "Test purpose",
      owner: "AI owner", impact: "Moderate", oversight: "Human approval", status: "Pilot"
    })
  });
  assert.equal(createdSystem.response.status, 201);
  const updatedSystem = await api(`/api/ai-systems/${createdSystem.body.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "In use", oversight: "Required review" })
  });
  assert.equal(updatedSystem.body.status, "In use");
  assert.equal(updatedSystem.body.oversight, "Required review");

  const createdAiRisk = await api("/api/ai-risks", {
    method: "POST",
    body: JSON.stringify({
      title: "Test AI risk", system: "Test AI system", dimension: "Reliability",
      inherent: "High", treatment: "Independent validation", owner: "AI risk owner",
      residual: "Medium", status: "Treatment"
    })
  });
  assert.equal(createdAiRisk.response.status, 201);
  const updatedAiRisk = await api(`/api/ai-risks/${createdAiRisk.body.id}`, {
    method: "PATCH",
    body: JSON.stringify({ residual: "Low", status: "Monitoring" })
  });
  assert.equal(updatedAiRisk.body.residual, "Low");
  assert.equal(updatedAiRisk.body.status, "Monitoring");

  const seeded = await api("/api/audits");
  assert.equal(seeded.response.status, 200);
  assert.equal(seeded.body.length, 1);
  assert.equal(seeded.body[0].tests.length, 3);
  const auditId = seeded.body[0].id;

  const badDate = await api("/api/audits", {
    method: "POST",
    body: JSON.stringify({
      title: "Bad date plan", framework: "Example policy", audit_type: "Internal",
      objective: "Check a process.", scope: "One process.", criteria: "Approved internal policy.",
      risk_level: "Medium", lead_auditor: "Auditor", start_date: "2026-02-31",
      end_date: "2026-03-02", status: "Planned"
    })
  });
  assert.equal(badDate.response.status, 400);
  assert.match(badDate.body.error, /valid calendar date/);

  const createdAudit = await api("/api/audits", {
    method: "POST",
    body: JSON.stringify({
      title: "Supplier security audit", framework: "Contract criteria; internal supplier policy",
      audit_type: "Supplier", objective: "Assess the supplier's in-scope service controls.",
      scope: "Hosting and support processes for the selected service.",
      criteria: "Current signed agreement; company supplier security policy v2.",
      risk_level: "High", lead_auditor: "Alex Auditor",
      team_competence: "Supplier assurance and cloud security expertise.",
      independence_notes: "Lead auditor has no operational ownership of the supplier.",
      communication_plan: "Opening meeting, daily escalation, closing meeting, restricted report distribution.",
      start_date: "2026-11-05",
      end_date: "2026-11-07", status: "Planned"
    })
  });
  assert.equal(createdAudit.response.status, 201);
  assert.equal(createdAudit.body.tests.length, 0);
  const supplierAuditId = createdAudit.body.id;

  const createdTest = await api(`/api/audits/${supplierAuditId}/tests`, {
    method: "POST",
    body: JSON.stringify({
      title: "Access review sampling", objective: "Check sampled access approvals.",
      procedure: "Select a sample and inspect approval evidence.",
      sampling_method: "Random sample from the full quarterly access population.",
      result: "Not tested"
    })
  });
  assert.equal(createdTest.response.status, 201);
  const testId = createdTest.body.id;
  assert.equal(createdTest.body.reference, "");
  assert.equal(createdTest.body.evidence_expected, "");
  assert.match(createdTest.body.sampling_method, /Random sample/);
  const pdf = new FormData();
  pdf.append("file", new Blob(["%PDF-1.4\nEvidence sample\n%%EOF"], { type: "application/pdf" }), "test-evidence.pdf");
  const uploadedEvidence = await api(`/api/tests/${testId}/evidence`, { method: "POST", body: pdf });
  assert.equal(uploadedEvidence.response.status, 201);
  assert.equal(uploadedEvidence.body.original_name, "test-evidence.pdf");
  const evidenceList = await api(`/api/tests/${testId}/evidence`);
  assert.equal(evidenceList.body.length, 1);
  const auditWithEvidence = await api(`/api/audits/${supplierAuditId}`);
  assert.equal(auditWithEvidence.body.tests[0].evidence[0].original_name, "test-evidence.pdf");
  const evidenceDownload = await api(`/api/evidence/${uploadedEvidence.body.id}/download`);
  assert.equal(evidenceDownload.response.status, 200);
  assert.match(evidenceDownload.response.headers.get("content-type"), /application\/pdf/);
  assert.match(evidenceDownload.body, /Evidence sample/);
  const invalidEvidence = new FormData();
  invalidEvidence.append("file", new Blob(["not a pdf"], { type: "application/pdf" }), "invalid.pdf");
  const badEvidenceSignature = await api(`/api/tests/${testId}/evidence`, { method: "POST", body: invalidEvidence });
  assert.equal(badEvidenceSignature.response.status, 400);
  const unsupportedEvidence = new FormData();
  unsupportedEvidence.append("file", new Blob(["not allowed"], { type: "application/octet-stream" }), "payload.exe");
  const badEvidenceType = await api(`/api/tests/${testId}/evidence`, { method: "POST", body: unsupportedEvidence });
  assert.equal(badEvidenceType.response.status, 400);
  const oversizedEvidence = new FormData();
  oversizedEvidence.append("file", new Blob([Buffer.alloc(10 * 1024 * 1024 + 1)], { type: "application/pdf" }), "large.pdf");
  const tooLargeEvidence = await api(`/api/tests/${testId}/evidence`, { method: "POST", body: oversizedEvidence });
  assert.equal(tooLargeEvidence.response.status, 413);
  assert.match(tooLargeEvidence.body.error, /10 MB/);

  const updatedTest = await api(`/api/tests/${testId}`, {
    method: "PATCH",
    body: JSON.stringify({ result: "Needs improvement", notes: "One approval was not retained." })
  });
  assert.equal(updatedTest.response.status, 200);
  assert.equal(updatedTest.body.result, "Needs improvement");
  assert.ok(updatedTest.body.tested_at);

  const badLink = await api(`/api/audits/${auditId}/findings`, {
    method: "POST",
    body: JSON.stringify({
      test_id: testId, title: "Cross-audit test reference", criteria: "A criterion.",
      condition: "A condition.", severity: "Medium", owner: "Owner", due_date: "2026-12-01", status: "Open"
    })
  });
  assert.equal(badLink.response.status, 400);
  assert.match(badLink.body.error, /this audit/);

  const resetUntested = await api(`/api/tests/${testId}`, {
    method: "PATCH",
    body: JSON.stringify({ result: "Not tested" })
  });
  assert.equal(resetUntested.response.status, 200);
  const untestedFinding = await api(`/api/audits/${supplierAuditId}/findings`, {
    method: "POST",
    body: JSON.stringify({
      test_id: testId, title: "Finding not linked to failed test", criteria: "A criterion.",
      condition: "A condition.", severity: "Medium", owner: "Owner", due_date: "2026-12-01", status: "Open"
    })
  });
  assert.equal(untestedFinding.response.status, 400);
  assert.match(untestedFinding.body.error, /requires a recorded Fail or Needs improvement/);

  await api(`/api/tests/${testId}`, {
    method: "PATCH",
    body: JSON.stringify({ result: "Needs improvement" })
  });
  const createdFinding = await api(`/api/audits/${supplierAuditId}/findings`, {
    method: "POST",
    body: JSON.stringify({
      test_id: testId, title: "Approval evidence not retained", criteria: "Supplier control evidence retention criterion.",
      condition: "One sampled access approval could not be produced.", severity: "Medium",
      owner: "Service owner", due_date: "2026-12-01", status: "Open",
      corrective_action: "Retain approvals in the controlled repository."
    })
  });
  assert.equal(createdFinding.response.status, 201);
  const findingId = createdFinding.body.id;

  const updatedFinding = await api(`/api/findings/${findingId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Ready for retest", corrective_action: "Updated repository index." })
  });
  assert.equal(updatedFinding.response.status, 200);
  assert.equal(updatedFinding.body.status, "Ready for retest");

  const forbiddenField = await api(`/api/audits/${supplierAuditId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Closed", arbitrary_sql: "ignored" })
  });
  assert.equal(forbiddenField.response.status, 400);
  assert.match(forbiddenField.body.error, /Unexpected field/);

  const events = await api(`/api/audits/${supplierAuditId}/events`);
  assert.equal(events.response.status, 200);
  assert.ok(events.body.length >= 4);
  const detail = await api(`/api/audits/${supplierAuditId}`);
  assert.equal(detail.body.tests.length, 1);
  assert.equal(detail.body.findings.length, 1);
  assert.equal(detail.body.findings[0].corrective_action, "Updated repository index.");
  assert.equal(detail.body.tests[0].evidence.length, 1);
  assert.match(detail.body.team_competence, /cloud security/);
  assert.match(detail.body.independence_notes, /no operational ownership/);
  const auditEvents = await api(`/api/audits/${supplierAuditId}/events`);
  assert.ok(auditEvents.body.some(event => event.actor === "admin@example.test"));

  await new Promise(resolve => server.close(resolve));
  db.close();
  db = createDatabase(dbPath);
  server = createApp(db, appOptions).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const persisted = await api(`/api/audits/${supplierAuditId}`);
  assert.equal(persisted.response.status, 200);
  assert.equal(persisted.body.tests[0].result, "Needs improvement");
  assert.match(persisted.body.tests[0].sampling_method, /Random sample/);
  assert.equal(persisted.body.findings[0].status, "Ready for retest");
  const persistedEvidence = await api(`/api/tests/${testId}/evidence`);
  assert.equal(persistedEvidence.body.length, 1);
  const deletedEvidence = await api(`/api/evidence/${uploadedEvidence.body.id}`, { method: "DELETE" });
  assert.equal(deletedEvidence.response.status, 204);
  assert.equal(fs.readdirSync(appOptions.uploadDirectory).length, 0);
  const persistedObligations = await api("/api/regulatory-obligations");
  const persistedObligation = persistedObligations.body.find(obligation => obligation.id === obligationId);
  assert.equal(persistedObligation.owner, "Updated compliance owner");
  assert.equal(persistedObligation.implementation, "In progress");
  assert.equal(persistedObligations.body.some(obligation => obligation.title === "Temporary obligation"), false);
  assert.equal((await api(`/api/risks/${riskId}`)).body.owner, "Updated risk owner");
  assert.equal((await api(`/api/controls/${createdControl.body.id}`)).response.status, 404);
  assert.equal((await api(`/api/controls`)).body.length, 5);
  assert.equal((await api(`/api/ai-systems/${createdSystem.body.id}`)).body.status, "In use");
  assert.equal((await api(`/api/ai-risks/${createdAiRisk.body.id}`)).body.status, "Monitoring");
  const persistedSettings = await api("/api/settings");
  assert.equal(persistedSettings.body.organization_name, "Northstar Test Org");
  assert.equal(persistedSettings.body.workspace_label, "Test workspace");

  const prematureClosure = await api(`/api/findings/${findingId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Closed" })
  });
  assert.equal(prematureClosure.response.status, 400);
  assert.match(prematureClosure.body.error, /closure_evidence/);
  const closeFinding = await api(`/api/findings/${findingId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Closed", closure_evidence: "Retest sample passed and reviewer signed." })
  });
  assert.equal(closeFinding.response.status, 200);
  assert.equal(closeFinding.body.status, "Closed");
});
