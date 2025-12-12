const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite');

db.serialize(async () => {

  // Users
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Vendors / Clients
  await db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Audit Questions
  await db.run(`CREATE TABLE IF NOT EXISTS audit_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_name TEXT NOT NULL,
    question TEXT NOT NULL,
    reference TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Responses
  await db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    evidence TEXT,
    evidence_name TEXT,
    remark TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES audit_questions(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
  )`);

  // Logos
  await db.run(`CREATE TABLE IF NOT EXISTS logos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    image BLOB,
    image_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
    ['admin', hashedPassword, 'admin']
  );

  // Seed initial audit questions
  const questions = [
    ['General', 'Kindly specify the technical details of the platform used?', 'ISO 27001, ISO 27036'],
    ['General', 'If outsourcing, SLA aspects decided? Consider licensing, escrow, QA, etc.', 'ISO 27036, RBI IT Outsourcing 2023'],
    ['Asset Management', 'Do you have an asset management program approved by management for your IT assets?', 'ISO 27036, ISO 27001']
  ];

  questions.forEach(([control, question, reference]) => {
    db.run(`INSERT OR IGNORE INTO audit_questions (control_name, question, reference) VALUES (?, ?, ?)`,
      [control, question, reference]
    );
  });

  console.log('Database seeded successfully!');
});

db.close();
