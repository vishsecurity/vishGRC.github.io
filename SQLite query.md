-- 1. Create tables
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_group TEXT,
    question TEXT,
    reference TEXT,
    domain TEXT
);

CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    uuid TEXT UNIQUE,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER,
    question_id INTEGER,
    answer TEXT,
    remarks TEXT,
    submitted_at TEXT
);

-- 2. Example insert questions
INSERT INTO questions (control_group, question, reference, domain) VALUES
('Control 1 - General Overview', 'Is the Application developed in-house or Outsourcing?', 'ISO 27001, ISO 27036', 'General Overview'),
('Control 2 - Asset Management', 'Do you have an asset management program approved by management?', 'ISO 27036, ISO 27001', 'Asset Management');
