-- Create table
CREATE TABLE IF NOT EXISTS audit_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_name TEXT,
    question TEXT,
    reference TEXT,
    implemented TEXT,
    evidence TEXT,
    remarks TEXT
);

-- Insert values one by one (you can combine these with commas if preferred)
INSERT INTO audit_questions (control_name, question, reference) VALUES
('General', 'Kindly specify the technical details of the platform used?', 'ISO 27001, ISO 27036');

INSERT INTO audit_questions (control_name, question, reference) VALUES
('General', 'If Outsourcing, SLA aspects decided? Whether points such as licensing arrangements, escrow arrangements, contractual requirement for quality assurance, are considered for the same?', 'ISO 27036, RBI IT Outsourcing 2023, [Chapter V]');

INSERT INTO audit_questions (control_name, question, reference) VALUES
('Asset Management', 'Do you have an asset management program approved by management for your IT assets?', 'ISO 27036, ISO 27001');

