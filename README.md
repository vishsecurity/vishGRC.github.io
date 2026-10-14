# GovernanceGuard

GovernanceGuard is a local-first governance, risk, and compliance (GRC) workspace designed to help teams manage audit planning, risk registers, controls, AI oversight, regulatory obligations, and board-ready reporting in one place. It combines a browser-based dashboard with a Node.js/Express API and a persistent SQLite database so organizations can track operational governance work without a large enterprise SaaS stack.

## What this tool is

This project is a practical GRC dashboard for:

- Managing risk and control registers
- Tracking audit programs, tests, findings, and evidence
- Monitoring regulatory obligations and deadlines
- Reviewing AI systems and AI risk items
- Producing a board-level snapshot and summary view
- Keeping one workspace profile and access roles for internal governance work

It is designed as a local prototype and internal management tool, not a substitute for legal advice, external audit certification, or enterprise-grade compliance SaaS.

## Required dependencies and plugins

This project requires:

- Node.js 20+
- npm
- Express
- better-sqlite3
- multer

Installed from the project dependencies in `package.json`:

```json
"dependencies": {
  "better-sqlite3": "^11.10.0",
  "express": "^5.1.0",
  "multer": "^2.4.0"
}
```

## Project files

- `server.js` — Node.js/Express app, authentication, routing, validation, file upload handling, and startup logic.
- `database.js` — SQLite schema, seed records, and data initialization.
- `index.html` — Main GRC dashboard and workspace UI.
- `login.html` — Sign-in page for unauthenticated users.
- `setup.html` — First-time admin setup page for new workspaces.
- `assets/` — Branding files such as the logo and mark.
- `data/` — Runtime database and evidence storage directory.
- `test/api.test.js` — Automated API and persistence tests.
- `package.json` and `package-lock.json` — Dependency and script configuration.
- `credentail.md` — Local credentials / setup notes for reference during development.

## Run locally

Requirements: Node.js 20 or later.

Start the app:

```sh
npm install
npm start
```

Open <http://127.0.0.1:3000>. On a new database, complete the one-time administrator setup page; setup is only accepted from the same machine and closes after the first account is created. Alternatively, bootstrap an account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters); optional display name comes from `ADMIN_NAME`. No default account or public registration is enabled. The server creates `data/grc.sqlite` on first start and seeds clearly labeled illustrative audit, risk, control, AI, and regulatory records. Audit plans, workpapers, findings, risks, controls, AI systems and risks, regulatory obligations, workspace profile, user accounts, sessions, evidence metadata, and application-level activity records persist in SQLite.

Override the local address, port, database path, or evidence directory with `HOST`, `PORT`, `GRC_DB_PATH`, or `GRC_EVIDENCE_PATH` environment variables. The default host is loopback (`127.0.0.1`).

## Hosting on your laptop or in the cloud

### Use on your laptop

Run `npm install` once, then start the app with `npm start` and open <http://127.0.0.1:3000> on that laptop. Keep the terminal open while using it; stop the server with Ctrl+C. The SQLite database and evidence files stay in the local `data/` directory.

To let another device on the **same trusted home/office network** connect, first create the Admin account from the laptop itself at `http://127.0.0.1:3000`. Then start the server listening on the LAN:

```sh
HOST=0.0.0.0 PORT=3000 npm start
```

Find the laptop's private LAN IP (for example, `192.168.1.25`) and open `http://192.168.1.25:3000` from the other device. Allow port 3000 only on the private network in the laptop firewall. This connection is plain HTTP: do not use it over public Wi-Fi, forward the port from your router, or upload sensitive evidence.

### Put it on a cloud VM

The current app stores both its SQLite database and uploaded evidence on disk. Use an Ubuntu VM with persistent disk storage (for example, an Oracle Cloud Always Free VM if available in your region, or another VPS). A static frontend host or an ephemeral container is **not** suitable for this app as-is: its database and attachments can be lost on restart/redeploy. A domain name is optional for testing but required for automatic HTTPS with Caddy. Cloud free-tier availability and pricing can change.

1. Create an Ubuntu VM and restrict SSH (port 22) to your IP. Point your domain's DNS `A` record to the VM address. In the cloud firewall and VM firewall allow ports 80 and 443; do not expose port 3000.
2. Install Node.js 20 or later, Git, and Caddy using their official Ubuntu installation instructions. Clone or upload this project into `/opt/governanceguard`. Keep the source private if it contains any organization-specific configuration.
3. Create a dedicated service account and persistent data directories, give it ownership of the app directory, then install dependencies as that non-root account:

   ```sh
   sudo useradd --system --home /opt/governanceguard --shell /usr/sbin/nologin governanceguard
   sudo mkdir -p /var/lib/governanceguard/evidence
   sudo chown -R governanceguard:governanceguard /opt/governanceguard /var/lib/governanceguard
   cd /opt/governanceguard
   sudo -u governanceguard npm ci
   ```

4. Create `/etc/governanceguard.env` as root with a unique administrator email, a randomly generated password of at least 12 characters, the administrator display name, and persistent paths. For example:

   ```ini
   HOST=127.0.0.1
   PORT=3000
   GRC_DB_PATH=/var/lib/governanceguard/grc.sqlite
   GRC_EVIDENCE_PATH=/var/lib/governanceguard/evidence
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=replace-with-a-unique-random-password
   ADMIN_NAME=Workspace Administrator
   ```

   Protect this file (`sudo chown root:root /etc/governanceguard.env && sudo chmod 600 /etc/governanceguard.env`). Bootstrap credentials are only used when the database has no user; after successful first startup, remove `ADMIN_PASSWORD` from the environment file and restart the service.
5. Create `/etc/systemd/system/governanceguard.service`:

   ```ini
   [Unit]
   Description=GovernanceGuard
   After=network.target

   [Service]
   Type=simple
   User=governanceguard
   Group=governanceguard
   WorkingDirectory=/opt/governanceguard
   EnvironmentFile=/etc/governanceguard.env
   ExecStart=/usr/bin/node server.js
   Restart=on-failure
   RestartSec=5
   NoNewPrivileges=true
   PrivateTmp=true

   [Install]
   WantedBy=multi-user.target
   ```

   If Node.js is installed somewhere other than `/usr/bin/node`, use the path from `command -v node`. Start and inspect the app:

   ```sh
   sudo systemctl daemon-reload
   sudo systemctl enable --now governanceguard
   sudo systemctl status governanceguard
   curl http://127.0.0.1:3000/api/health
   ```

6. Configure Caddy with your real domain in `/etc/caddy/Caddyfile`:

   ```caddyfile
   grc.example.com {
       encode zstd gzip
       reverse_proxy 127.0.0.1:3000
   }
   ```

   Replace `grc.example.com` with your domain, then run `sudo systemctl reload caddy`. Once DNS resolves and ports 80/443 are reachable, Caddy obtains and renews HTTPS certificates automatically. Open `https://grc.example.com` and sign in. Caddy must run on the same VM (the app trusts forwarded HTTPS headers only from loopback).

7. Back up the database and the entire evidence directory regularly, store backups separately from the VM, and test restoring them. Keep Ubuntu, Node.js, dependencies, and Caddy updated. Check logs with `sudo journalctl -u governanceguard`.

**Security warning:** this project is still a local prototype, not production-ready software. Hosting it on the public internet exposes a system without MFA, encrypted-at-rest evidence management, malware scanning, managed backups, or a tamper-proof audit trail. Do not store sensitive/client-confidential evidence or use it for compliance decisions until it has had a security/privacy review and the necessary safeguards are implemented. HTTPS and a firewall alone do not make it production-ready.

## Accounts and roles

- **Admin:** can manage organization settings, create accounts, assign roles, deactivate accounts, and reset passwords. At least one active administrator is always required.
- **Editor:** can create and maintain GRC records and upload evidence; cannot manage users or change workspace settings.
- **Viewer:** has read-only access.

Administrators provision accounts from Settings; self-registration is disabled. Passwords are stored as salted scrypt hashes. Sign-in sessions use random opaque tokens stored as hashes in SQLite and `HttpOnly`, `SameSite=Strict` cookies, expire after eight hours, and are revoked at sign-out or when an account is deactivated/password-reset. Sign-in attempts are rate-limited per process and client address.

## Evidence attachments

Attach files to individual audit workpaper tests. PDF, PNG, JPEG, GIF, WebP, and common Word, Excel, and PowerPoint formats are accepted, up to 10 MB per file. The server checks extension, declared media type, and basic file signatures. Files are stored outside the web root under `data/evidence` by default, while SQLite stores metadata. Download and delete require sign-in. Evidence storage is local and is not virus-scanned, encrypted at rest, backed up, or protected from host-level access; do not upload sensitive/client-confidential evidence until suitable controls are added.

## Board reporting

The board report and overview use current stored risks, controls, audit tests/findings/evidence, obligations, and AI records. Figures are live register snapshots, not historical trends: the application does not maintain period-end snapshots and does not claim a change over time. The board pack export is a CSV snapshot. Review its scope and validate the information before distributing it.

## Workflow

GovernanceGuard is intended to follow a simple operational workflow for a compliance or internal audit team:

1. **Set up workspace**
   - Create the first admin account.
   - Define the organization name and workspace label.
   - Set user roles for Admin, Editor, and Viewer.

2. **Capture governance context**
   - Add risk registers, control library entries, and regulatory obligations.
   - Assign owners, review dates, and status values.
   - Capture AI system and AI risk inventory when relevant.

3. **Plan audits and tests**
   - Create an audit program with scope, criteria, objective, and timeline.
   - Add audit tests and expected evidence.
   - Record testing procedures and sampling rationale.

4. **Perform execution**
   - Run each test, record result and notes.
   - Attach evidence files such as PDFs, screenshots, or spreadsheets.
   - Track workpaper status as the audit moves forward.

5. **Report findings and actions**
   - Raise issues with criteria, condition, cause, impact, and owner.
   - Assign due dates and track remediation status.
   - Maintain retest and closure evidence for follow-up.

6. **Monitor and report upward**
   - Review live KRI and control effectiveness summaries.
   - Check open actions and board-level status.
   - Export board reports or CSV snapshots for leadership.

This workflow keeps governance, compliance, and audit work connected in one operational loop instead of separate disconnected spreadsheets.

## ISO 19011-informed workflow

The audit workbench is designed around a practical audit lifecycle:

1. **Initiate and plan:** document authority, objectives, boundaries, applicable criteria, risk priorities, competent audit lead/team, impartiality safeguards, communication arrangements, dates, and status.
2. **Prepare:** define audit tests, sampling method and rationale, procedures, and expected evidence.
3. **Perform:** record workpaper results, evidence references, notes, and tester.
4. **Report:** capture criteria, condition, cause, impact, severity, and accountable owner as a finding.
5. **Follow up:** maintain due dates and corrective actions, then move findings through retest/closure states with closure evidence.

The UI also surfaces the auditing principles of integrity, fair presentation, due professional care, confidentiality, independence, evidence-based and risk-based approaches, plus auditor competence as a practical quality prompt.

ISO 19011 is guidance for auditing management systems; it is not itself the audit criteria for determining an organization's conformity. For each engagement, enter the requirements that apply to the scope—such as an ISO management-system standard, NIST framework, regulation, contract, or internal policy—and use licensed authoritative materials. This project intentionally does not reproduce standard text or claim compliance, certification, legal advice, or an audit opinion.

## Full folder and file list

### Root folders

- `assets/` — branding and logo images used by the UI
- `data/` — SQLite database and uploaded evidence storage
- `test/` — automated API test files

### Root files

- `README.md` — project documentation and setup guide
- `package.json` — project metadata and dependencies
- `package-lock.json` — lockfile for installed packages
- `server.js` — main Node.js/Express server and API logic
- `database.js` — SQLite schema, seed data, and DB initialization
- `index.html` — main dashboard interface
- `login.html` — login screen
- `setup.html` — first-time workspace setup screen
- `credentail.md` — local credential notes

### Generated runtime files

- `data/grc.sqlite` — created automatically at runtime
- `data/evidence/` — created automatically for uploaded attachments

### Packages used

```json
"dependencies": {
  "better-sqlite3": "^11.10.0",
  "express": "^5.1.0",
  "multer": "^2.4.0"
}
```

Install them with:

```bash
npm install
```

## API

- `GET /api/health`
- `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout`
- `GET|POST /api/users`, `PATCH /api/users/:id`, `POST /api/users/:id/password` (Admin only)
- `GET /api/audits`, `POST /api/audits`
- `GET /api/audits/:id`, `PATCH /api/audits/:id`
- `POST /api/audits/:id/tests`, `PATCH /api/tests/:id`
- `GET|POST /api/tests/:id/evidence`
- `GET /api/evidence/:id/download`, `DELETE /api/evidence/:id`
- `POST /api/audits/:id/findings`, `PATCH /api/findings/:id`
- `GET /api/audits/:id/events`
- `GET /api/regulatory-obligations`, `POST /api/regulatory-obligations`, `PATCH|DELETE /api/regulatory-obligations/:id`
- `GET|POST /api/risks`, `GET|PATCH|DELETE /api/risks/:id`
- `GET|POST /api/controls`, `GET|PATCH|DELETE /api/controls/:id`
- `GET|POST /api/ai-systems`, `GET|PATCH|DELETE /api/ai-systems/:id`
- `GET|POST /api/ai-risks`, `GET|PATCH|DELETE /api/ai-risks/:id`
- `GET|PATCH /api/settings`

Records are stored in the `audit_programs`, `audit_tests`, `audit_findings`, `risks`, `controls`, `ai_systems`, `ai_risks`, `regulatory_obligations`, `workspace_settings`, `users`, `user_sessions`, and `evidence_files` tables; `audit_events` records application-level changes with the authenticated actor where available. Inputs are validated server-side and SQL uses parameterized values. The web server serves only the application page and API, not project files, the database, or attachment storage.

This remains a local prototype, not a production-ready security boundary. Account controls do not include MFA, email verification, self-service recovery, durable distributed rate limiting, tenant isolation, password policy against breached-password lists, or a tamper-proof audit trail. There is no evidence malware scanning, encryption-at-rest management, backup/restore workflow, retention policy, or production deployment hardening. Keep it on a trusted local machine, protect the host and database files, and complete a security/privacy review before any network exposure or sensitive use.

Risk, control, AI system, AI risk, regulatory obligation, audit, and workspace profile records can be created and updated through the application; core registers also support deletion. Seed records are illustrative and must be replaced or verified; the regulatory tracker is not an authoritative source of compliance guidance. Framework crosswalk, audit-methodology guidance, and other descriptive reference content remain illustrative.

## Project files

- `server.js` — Express API, account/session authentication, role authorization, request validation, evidence upload/download, and local HTTP server startup.
- `database.js` — SQLite schema, compatibility columns, initialization, and illustrative seed records.
- `index.html` — Single-page GRC dashboard, database-backed registers, workpaper/evidence UI, board snapshots, and account administration.
- `login.html` — Sign-in page served to unauthenticated visitors.
- `assets/governanceguard-logo.png` — User-provided full shield and wordmark artwork for sign-in/setup.
- `assets/governanceguard-mark.png` — Shield crop used in the dashboard navigation.
- `test/api.test.js` — API integration tests covering persistence, validation, authentication, role restrictions, and evidence attachment lifecycle.
- `package.json` / `package-lock.json` — Runtime dependencies and npm scripts.
- `data/grc.sqlite` — Created at runtime for SQLite persistence; ignored by Git.
- `data/evidence/` — Created at runtime for uploaded evidence; ignored by Git.

Made by Vishal Chaudhary.

## Tests

```sh
npm test
```
