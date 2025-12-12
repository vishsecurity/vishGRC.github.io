# **GRC TPRM Admin Dashboard**

## **Overview**

The **GRC TPRM Admin Dashboard** is a **Node.js + Express** platform for **Third-Party Risk Management (TPRM)**. It enables administrators and auditors to manage vendors, audits, questions, and evidence securely while maintaining an auditable workflow.

Key technologies:

* **Backend:** Node.js, Express, SQLite, JWT authentication
* **Frontend:** Materialize CSS (responsive UI)
* **Security:** Helmet headers, rate limiting, secure vendor links

**Core capabilities:**

* Vendor & auditor management with role-based access
* Audit and questionnaire creation & organization
* Evidence submission by vendors (files + remarks)
* Email notifications and reminders
* Audit logging for compliance
* Risk tracking and reporting dashboards

---

## **Key Features**

* **Auditor-Vendor Management:** Assign auditors to vendors with strict access controls
* **Vendor-Audit Mapping:** Link vendors to audits securely
* **Role-Based Authentication:** Admin, auditor, and vendor with JWT login
* **Input Validation & Error Handling:** Protect against invalid requests
* **File Uploads:** Vendors can upload PDFs, images, Word, Excel, PPT (sanitized & limited size)
* **Email Notifications:** Automatic vendor reminders with retry logic
* **Audit Logging:** Track all critical user actions
* **Advanced Reporting:** Dashboard showing risk scores and response completion
* **Seed Data & Testing:** Pre-seeded admin account and sample questions

---

## **Database Schema**

### **`users`**

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **`vendors`**

```sql
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  domain TEXT
);
```

### **`audits`**

```sql
CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **`questions`**

```sql
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id INTEGER,
  control_name TEXT NOT NULL,
  question TEXT NOT NULL,
  type TEXT,
  reference TEXT,
  FOREIGN KEY(audit_id) REFERENCES audits(id)
);
```

### **`responses`**

```sql
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  question_id INTEGER,
  remark TEXT,
  evidence TEXT,
  evidence_name TEXT,
  approved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(vendor_id) REFERENCES vendors(id),
  FOREIGN KEY(question_id) REFERENCES questions(id)
);
```

### **`auditor_vendor`**

```sql
CREATE TABLE IF NOT EXISTS auditor_vendor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auditor_id INTEGER,
  vendor_id INTEGER,
  UNIQUE(auditor_id, vendor_id),
  FOREIGN KEY(auditor_id) REFERENCES users(id),
  FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);
```

### **`vendor_audit`**

```sql
CREATE TABLE IF NOT EXISTS vendor_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  audit_id INTEGER,
  UNIQUE(vendor_id, audit_id),
  FOREIGN KEY(vendor_id) REFERENCES vendors(id),
  FOREIGN KEY(audit_id) REFERENCES audits(id)
);
```

### **`audit_logs`**

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **`vendor_links`**

```sql
CREATE TABLE IF NOT EXISTS vendor_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  audit_id INTEGER,
  token TEXT UNIQUE,
  expires_at TEXT,
  FOREIGN KEY(vendor_id) REFERENCES vendors(id),
  FOREIGN KEY(audit_id) REFERENCES audits(id)
);
```

---

## **Sample Seed Data**

```sql
INSERT INTO users (username, password, role) VALUES ('admin', '<hashed_password>', 'admin');

INSERT INTO audits (name, description) VALUES ('Security Audit Q1', 'Initial IT security audit');

INSERT INTO questions (audit_id, control_name, question, type) VALUES
  (1, 'General', 'Provide platform technical details', 'High'),
  (1, 'Asset Management', 'Is there an approved IT asset management program?', 'Critical');
```

---

## **Getting Started**

1. **Install prerequisites**

   * Node.js v18+
   * npm

2. **Clone the repository**

```bash
git clone https://github.com/<your-repo>/GRC-TPRM
cd GRC-TPRM
```

3. **Install dependencies**

```bash
npm install
```

4. **Configure environment variables (.env)**

```text
PORT=5000
JWT_SECRET=your_jwt_secret
DB_PATH=./audit.db
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=yourpassword
CLIENT_URL=http://localhost:3000
```

5. **Start the server**

```bash
node server.js
```

6. **Access the API**

Open: `http://localhost:5000`
Vendor links and dashboard are served via SPA frontend.

---

## **System Flow**

```text
Admin / Auditor:
  - Create users & vendors
  - Define audits & questions
  - Assign auditors to vendors
  - Generate secure vendor links
  - Monitor responses & risk dashboard

Vendor:
  - Receives secure link via email
  - Submits responses & uploads evidence
  - Admin/auditor approves responses
```

---

## **Folder Structure**

```
project/
├── server.js           # Backend APIs, DB setup, file handling
├── audit.db            # SQLite database
├── uploads/            # Vendor evidence files
├── package.json
├── .env                # Environment variables
└── README.md
```

---

## **Security Features**

* JWT authentication with role-based access
* Helmet headers for HTTP security
* Rate limiting to prevent abuse
* Input validation & sanitization
* Secure expiring vendor links
* Audit logging of all critical actions

---

## **Next Steps / Future Enhancements**

* Frontend SPA for admin and vendor portals
* Advanced reporting (risk heatmaps, compliance dashboards)
* Improved email templates & retry logic
* Cloud deployment (AWS: EC2, Elastic Beanstalk, S3, CloudFront)
* Docker + PM2 support for production