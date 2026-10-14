# GovernanceGuard: A Local-First GRC Workbench

GovernanceGuard is a lightweight governance, risk, and compliance platform built for teams that want to manage their risk and audit work in one place. Instead of scattered spreadsheets, email threads, and patchwork trackers, this project gives users a single workspace to maintain risk registers, compliance obligations, control testing, audit evidence, and board-level reporting.

## What the tool does

This tool is designed to help organizations:

- Maintain a risk register with ownership and review dates
- Track controls and related evidence
- Manage audit programs, workpapers, tests, and findings
- Monitor regulatory obligations and deadlines
- Review AI systems and AI-related risks
- Export a board-ready snapshot for leadership reporting
- Keep a minimal, local-first governance workspace for internal use

The interface includes dashboard widgets, register tables, audit workflow views, and a settings page for workspace administration.

## Why it matters

Many small and mid-sized teams need GRC tracking but do not want the cost and complexity of an enterprise vendor platform. GovernanceGuard offers a practical local-first approach:

- Simple installation
- Local SQLite persistence
- Browser-based dashboard
- Built-in evidence uploads
- Audit and risk workflow tracking
- Clear internal workspace structure

## Required tools and plugins

This project runs on Node.js and standard npm packages. The required runtime dependencies are:

- Node.js 20 or later
- npm
- Express
- better-sqlite3
- multer

These are defined in the project package and are installed with:

```bash
npm install
```

## Main project files

- `server.js` — API server and business logic
- `database.js` — SQLite schema and seed data
- `index.html` — Main application UI
- `login.html` — Login page
- `setup.html` — Initial workspace setup page
- `assets/` — Branding assets
- `data/` — SQLite database and evidence storage
- `test/api.test.js` — Automated tests
- `package.json` — Scripts and dependencies
- `README.md` — Setup and usage documentation

## How to run it

```bash
npm install
npm start
```

Then open the app in a browser at:

```text
http://127.0.0.1:3000
```

## Final note

GovernanceGuard is best understood as a local governance and audit workbench prototype. It is useful for internal tracking, operational oversight, and practical GRC management, but it should not be treated as a replacement for formal legal, compliance, or audit advice.
