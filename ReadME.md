# **GRC TPRM Admin Dashboard**

## **Overview**

The **GRC TPRM Admin Dashboard** is a web‑based platform for managing third‑party risk assessments — covering vendors, clients, and audit questions — in a Governance, Risk & Compliance (GRC) context. Built with **Node.js**, **Express**, **SQLite**, and **Materialize CSS**, it enables administrators to:

* Define audit/control‑questions and organize them by domain
* Assign questions to vendors/clients or send questionnaires via email
* Collect responses: upload evidence (files), add remarks
* Track response completion status per vendor/client
* Manage users with role‑based access (admin / user / vendor/client)
* Manage vendor/client records (name, email, type)
* Optionally store and manage logos (e.g., vendor/client logos)

All pages include a footer with **“Vishal Chaudhary © All rights reserved”**.

---

## **Features**

* Dynamic listing of all audit questions stored in database
* Filtering questions by **domain / control group**
* Add / edit / delete questions
* Upload evidence files (PDF, Word, Excel, PPT, images) with remarks
* Persist responses in a `responses` table linked to questions and vendors
* Send questionnaires (selected questions) via email to vendors/clients
* Track and display progress / completion percentage per vendor/client
* Role‑based user management: admin can create users and assign roles
* Separate vendor/client management: add, delete, maintain contact info
* Responsive UI using Materialize CSS, suitable for desktop and mobile

---

## **Database Schema**

Below are the main tables used by the application:

### **`users`**

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,  -- e.g., admin, vendor, client
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **`vendors`** *(vendors and clients)*

```sql
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,        -- vendor or client
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **`audit_questions`**

```sql
CREATE TABLE IF NOT EXISTS audit_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  control_name TEXT NOT NULL,
  question TEXT NOT NULL,
  reference TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **`responses`**

```sql
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  vendor_id INTEGER NOT NULL,
  evidence TEXT,
  evidence_name TEXT,
  remark TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES audit_questions(id),
  FOREIGN KEY (vendor_id)   REFERENCES vendors(id)
);
```

### **`logos`** *(optional – for vendor/client logos)*

```sql
CREATE TABLE IF NOT EXISTS logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,          -- e.g., vendor or client
  image BLOB,
  image_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Sample Data (Initial Questions)**

```sql
INSERT INTO audit_questions (control_name, question, reference) VALUES
  ('General', 'Kindly specify the technical details of the platform used?', 'ISO 27001, ISO 27036'),
  ('General', 'If outsourcing, SLA aspects decided? Consider licensing, escrow, QA, etc.', 'ISO 27036, RBI IT Outsourcing 2023'),
  ('Asset Management', 'Do you have an asset management program approved by management for your IT assets?', 'ISO 27036, ISO 27001');
```

---

## **Getting Started (Setup Instructions)**

1. **Install prerequisites:**
   Ensure you have **Node.js (v18+)** and **npm** installed on your machine.

2. **Clone or download the project:**

   ```bash
   git clone https://github.com/<your‑repo>/GRC‑TPRM
   cd GRC‑TPRM
   ```

3. **Install dependencies:**

   ```bash
   npm install express sqlite3 cors multer nodemailer bcrypt
   ```

4. **Start the server:**

   ```bash
   node server.js
   ```

   The server will run on `http://localhost:3000`, serving both backend APIs and frontend static files.

5. **Open the application:**
   The first page shown will be the **login page**. After successful login, you can access the admin dashboard to manage users, vendors, questions, send questionnaires, etc.

---

## **Folder Structure**

```
project/
├── server.js             # Backend APIs, database setup, file handling
├── public/               # Frontend UI files (HTML, CSS, JS)
│   ├── index.html        # Main SPA with login, admin, vendor views
│   └── assets/           # (optional) CSS/JS assets
├── database.sqlite       # SQLite database file
├── uploads/              # Uploaded evidence files
├── package.json
└── README.md
```

*This layout helps developers quickly understand where to find backend logic, frontend UI, database, and uploaded files.* ([shift3.github.io][1])

---

## **System Flow**

```text
┌─────────────────────────┐
│      index.html         │
│-------------------------│
│  - Login view (first)   │
│  - Hash routing (SPA)   │
└───────────┬─────────────┘
            ▼
 ┌─────────────────────────┐
 │  Admin Dashboard        │
 │-------------------------│
 │  - Manage users         │
 │  - Manage vendors       │
 │  - Add/edit questions   │
 │  - Send questionnaires  │
 │  - Monitor progress     │
 └───────────┬─────────────┘
             ▼   (vendor link)
 ┌─────────────────────────┐
 │ Vendor Questionnaire    │
 │-------------------------│
 │  - Vendor fills responses│
 │  - Uploads evidence      │
 │  - Stored in responses   │
 └─────────────────────────┘
```

---

## **Usage & Workflows**

* **Admin** logs in → creates users and vendors → defines audit questions → selects vendors → sends questionnaire links
* **Vendor/Client** receives email link → opens the vendor form → fills responses and uploads evidence → submitted data updates the backend
* **Admin** monitors progress and response completion for each vendor/client

This structure ensures clarity of purpose and ease of onboarding for any developer or team member reading your repository documentation. ([glegoux.com][2])

---

## **Why This README Matters**

A README is often the **first impression** for anyone interacting with your project — whether a developer, reviewer, or user. A clear structure with essential sections (overview, setup, usage, architecture) helps others quickly understand what your project does and how to use it, which is a recommended documentation practice. ([Netguru][3])

---

## **Next Steps / Future Improvements**

* Add **environment configuration** (e.g., SMTP credentials, domain) using `.env`
* Implement secure authentication (sessions/JWT)
* Add role‑based access control
* Add **email templates** for questionnaire links
* Expand documentation with screenshots and examples

Here’s a **ready‑to‑insert expanded AWS Deployment section** you can append to the README you shared — covering the major AWS deployment options (Elastic Beanstalk, EC2, S3 + CloudFront) with step‑by‑step guidance. It’s written in the same *professional README style* and includes up‑to‑date AWS references.

---

## 🚀 **AWS Deployment (Elastic Beanstalk, EC2, S3 + CloudFront)**

Your **GRC TPRM Admin Dashboard** (Node.js + Express + SQLite + SPA frontend) can be deployed to AWS using one of the following common approaches depending on needs for simplicity, control, and scalability.

---

### **1) AWS Elastic Beanstalk (Recommended for Full Stack Apps)**

**Elastic Beanstalk** is AWS’s platform‑as‑a‑service that automatically handles provisioning, deployment, load balancing, monitoring, and scaling for Node.js applications. ([AWS Documentation][1])

#### **Prerequisites**

* AWS account
* AWS CLI and **EB CLI** installed and configured
* Your project (with `package.json` and start command defined)

#### **Deployment Steps**

1. **Initialize the EB CLI in your project directory**

   ```bash
   eb init -p node.js my-tprm-app
   ```

   * Select your AWS region and application name.
   * This creates a `.elasticbeanstalk/` config folder. ([AWS Documentation][1])

2. **Create an Elastic Beanstalk environment**

   ```bash
   eb create tprm-env
   ```

   * This provisions a load‑balanced environment with EC2, security groups, and an application URL. ([AWS Documentation][1])

3. **Open the deployed app**

   ```bash
   eb open
   ```

   * Opens your app’s public URL in a browser. ([AWS Documentation][1])

4. **Deploy new versions easily**

   ```bash
   eb deploy
   ```

   * Re‑deploy after code changes. ([AWS Documentation][2])

5. **Clean up (when done)**

   ```bash
   eb terminate
   ```

   * Removes environment and associated AWS resources. ([AWS Documentation][1])

**Notes**

* Elastic Beanstalk expects a valid `package.json` and uses `npm start` to run your app by default. ([AWS Documentation][2])
* For Express apps, ensure your backend listens on `process.env.PORT`. ([AWS Documentation][2])
* This option minimizes infrastructure management while providing auto‑scaling and health monitoring. ([AWS Documentation][1])

---

### **2) AWS EC2 (Manual Server Hosting)**

Use EC2 when you want **full control over the server**:

1. **Launch an EC2 instance**

   * Choose Amazon Linux/Ubuntu, open SSH (22) and HTTP (80) ports.
   * Create/attach a key pair for SSH access.

2. **SSH into the instance**

   ```bash
   ssh -i /path/to/key.pem ec2-user@<your-ec2-ip>
   ```

3. **Install Node.js & npm**

   * Use the distro’s package manager (e.g., `apt`, `yum`).

4. **Copy your project and install dependencies**

   ```bash
   scp -r ./your‑project ec2-user@...
   cd your-project
   npm install
   ```

5. **Run your app using a process manager**

   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

   * PM2 keeps your app running and restarts it on failure.

**Notes**

* EC2 requires more setup and maintenance than Elastic Beanstalk.
* You manage OS updates, security patches, and scaling.

---

### **3) Frontend on S3 + CloudFront + Backend on AWS**

This splits frontend hosting and backend APIs:

#### **Frontend (SPA)**

1. Build your SPA (`index.html` and assets).
2. Upload to an **S3 bucket** configured for static website hosting.
3. Use **CloudFront** as a CDN with SSL and caching.

#### **Backend API Hosting**

* Host the backend (Express API) separately via:

  * AWS Elastic Beanstalk
  * EC2
  * AWS Lambda + API Gateway (serverless)

```
S3 (UI assets) ← CloudFront CDN → Backend API (Elastic Beanstalk / EC2 / Lambda)
```

**Notes**

* S3 + CloudFront provides low cost, global edge caching.
* Backend remains decoupled — ideal for scaling. ([Reddit][3])

---

## 📌 Summary of AWS Options

| Deployment Type           | Easy Setup | Control | Scalability | Cost |
| ------------------------- | ---------- | ------- | ----------- | ---- |
| **Elastic Beanstalk**     | ⭐⭐⭐        | ⭐⭐      | ⭐⭐⭐         | ⭐⭐   |
| **EC2 Hosting**           | ⭐          | ⭐⭐⭐     | ⭐⭐          | ⭐⭐   |
| **S3 + CloudFront + API** | ⭐⭐         | ⭐⭐      | ⭐⭐⭐         | ⭐⭐⭐  |

**Elastic Beanstalk** is usually the best mix of simplicity and AWS integration for Node.js full‑stack apps. **S3 + CloudFront** excels for frontend assets with API decoupling and global delivery. **EC2** gives the most control but requires more ops work.

---

## 🧠 Helpful AWS Notes

* Elastic Beanstalk provisions EC2 instances, load balancers, and other resources automatically. ([AWS Documentation][1])
* Your app should have a proper `package.json` start script so Elastic Beanstalk detects and runs it correctly. ([AWS Documentation][2])
* For static hosting with CloudFront, S3 serves UI files while CloudFront caches globally. ([Reddit][4])

---

### 📌 Insert This Section into Your README

You can copy the following block into your README under your AWS note:

```
## 🚀 AWS Deployment

We support deployment via **Elastic Beanstalk**, **EC2 manual setup**, or **Static Frontend + CloudFront**.

### Elastic Beanstalk

1. Install AWS CLI & EB CLI.
2. Init your project: `eb init -p node.js my‑app`.
3. Create environment: `eb create my‑env`.
4. Open the deployed app: `eb open`.
5. Deploy updates: `eb deploy`.
6. Remove resources: `eb terminate`. :contentReference[oaicite:13]{index=13}

### EC2

1. Launch EC2 with SSH & HTTP open.
2. SSH in and install Node.js.
3. Deploy app & run with a process manager (e.g., PM2).

### Static + CloudFront

1. Host UI in S3 with static website hosting.
2. Use CloudFront CDN to serve frontend globally.
3. Host backend APIs separately (Elastic Beanstalk/EC2/Lambda). :contentReference[oaicite:14]{index=14}
```



