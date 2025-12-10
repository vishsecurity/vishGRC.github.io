# **GRC TPRM Admin Dashboard**

## **Overview**

The **GRC TPRM Admin Dashboard** is a web-based interface for managing **clients, vendors, and audit questions** in a Governance, Risk, and Compliance Third-Party Risk Management system. Built with **Node.js**, **Express**, and **SQLite**, it allows administrators to track audit questions, upload evidence and remarks, manage logos, and keep the dashboard synchronized with the database.

---

## **Features**

* Display all audit questions dynamically from the database.
* Filter questions by **Domain**.
* Add, edit, and delete questions.
* Upload **evidence files** (PDF, Word, JPEG, PNG) and add **remarks**.
* Store evidence and remarks in the `audit_questions` table or a separate `responses` table.
* Upload and manage **client or auditor logos**, visible directly on the dashboard.
* Send selected questions via email with dynamic sender credentials.
* Dashboard automatically updates to reflect changes in the database.

---

## **Database Setup**

### **Create `audit_questions` Table**

```sql
CREATE TABLE IF NOT EXISTS audit_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_name TEXT,
    question TEXT,
    reference TEXT,
    implemented TEXT,
    evidence TEXT,
    remarks TEXT
);
```

### **Insert Initial Questions**

```sql
INSERT INTO audit_questions (control_name, question, reference) VALUES
('General', 'Kindly specify the technical details of the platform used?', 'ISO 27001, ISO 27036');

INSERT INTO audit_questions (control_name, question, reference) VALUES
('General', 'If Outsourcing, SLA aspects decided? Consider licensing, escrow, QA, etc.', 'ISO 27036, RBI IT Outsourcing 2023, [Chapter V]');

INSERT INTO audit_questions (control_name, question, reference) VALUES
('Asset Management', 'Do you have an asset management program approved by management for your IT assets?', 'ISO 27036, ISO 27001');
```

> These entries ensure the dashboard displays pre-existing questions automatically.

---

## **Setup Instructions**

1. Install **Node.js v18+** and **npm**.
2. Clone or download the project folder.
3. Install dependencies:

```bash
npm install express sqlite3 body-parser cors multer nodemailer
```

4. Start the server:

```bash
node server.js
```

5. Open `admin.html` in your browser.

---

## **Folder Structure**

```
project/
├── server.js          # Backend API and file handling
├── admin.html         # Frontend dashboard
├── database.sqlite    # SQLite database
├── uploads/           # Temporary storage for uploaded files
├── package.json
└── README.md
```

---

## **Database Tables**

1. **audit_questions**

   * `id` – Primary key
   * `control_name` – Domain / control group
   * `question` – Question text
   * `reference` – Reference material
   * `implemented` – Yes/No (optional)
   * `evidence` – File path or name
   * `remarks` – User remark

2. **responses** (optional if storing evidence separately)

   * `id` – Primary key
   * `question_id` – Linked question
   * `evidence` – File content (BLOB)
   * `evidence_name` – Original file name
   * `remark` – User remark
   * `created_at` – Timestamp

3. **logos**

   * `id` – Primary key
   * `type` – Client or Auditor
   * `image` – Logo file (BLOB)
   * `image_name` – Original file name

---

## **System Flow Diagram**

```text
┌─────────────────────────┐
│      admin.html         │
│-------------------------│
│  - Display Questions    │
│  - Filter by Domain     │
│  - Upload Evidence      │
│  - Add Remarks          │
│  - Add/Delete Questions │
└───────────┬─────────────┘
            │
            ▼
 ┌─────────────────────────┐
 │       API Endpoints     │
 │-------------------------│
 │  GET /questions         │
 │  POST /questions        │
 │  DELETE /questions/:id  │
 │  POST /responses        │
 │  POST /logos            │
 │  POST /send-questions   │
 └───────────┬─────────────┘
             │
             ▼
 ┌─────────────────────────┐
 │       SQLite DB         │
 │-------------------------│
 │ audit_questions         │
 │ responses               │
 │ logos                   │
 └─────────────────────────┘
```

---

### **Key Points**

* Questions appear on the dashboard from the `audit_questions` table.
* Evidence and remarks are stored and linked to each question.
* Domains update automatically when new questions are added.
* Uploaded logos display directly on the dashboard.


