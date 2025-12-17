# **Acquisory TPRM – Vendor Risk Assessment Platform**

**Acquisory Third-Party Risk Management (TPRM)** is a **lightweight, self-hosted vendor assessment platform** built using **Node.js, Express, and SQLite**, with **simple HTML/JS frontends** for admins and vendors.

It enables organizations to **design domain-specific risk questionnaires**, securely distribute them to vendors, collect evidence, and **track incomplete or high-risk responses** — without complex infrastructure.

✅ SMB-friendly
✅ Self-hosted
✅ Domain-based questionnaires
✅ Secure vendor links

---

## **Key Capabilities**

### **Admin Capabilities**

* **User & role management**

  * Create / delete admin and reviewer users
* **Vendor management**

  * Bulk upload, edit, activate/deactivate vendors
* **Questionnaire management**

  * Bulk CSV upload
  * Edit / version questions
  * Domain-based control grouping
* **Secure vendor link generation**

  * Unique, vendor-specific URLs
  * Regeneration and expiry support
* **Assessment tracking dashboard**

  * Vendor-wise completion status
  * Pending / incomplete controls
  * Evidence download
* **Audit traceability**

  * Who sent links
  * Who submitted responses
  * Timestamped activity logs

---

### **Vendor Capabilities**

* Access questionnaire via **secure unique link**
* Answer domain-specific controls only
* Upload evidence files:

  * PDF, DOCX, XLSX, PPTX, PNG, JPEG
* Save partial progress (draft mode)
* Resume incomplete assessments before expiry

---

## **Security & Reliability**

* JWT-based authentication for admins
* Vendor access via **time-bound, tokenized links**
* Input validation and file-type restrictions
* SQLite database with transactional integrity
* Controlled file uploads via Multer
* HTTPS access for vendors using ngrok or reverse proxy

> ⚠️ **Note:** SQLite encryption and virus scanning are optional enhancements and not enabled by default.

---

## **Technology Stack**

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Backend API     | Node.js + Express           |
| Database        | SQLite                      |
| Frontend        | Plain HTML, CSS, JavaScript |
| Auth            | JWT                         |
| File Uploads    | Multer                      |
| Email           | Nodemailer                  |
| External Access | ngrok (HTTPS tunnel)        |

---

## **Architecture Flow**

```
Admin (Browser)
   │
   │  localhost:4000
   ▼
Admin HTML Pages
   │
   ▼
Express API  ─── SQLite (tprm.db)
   │
   ├── Evidence Files (uploads/)
   │
   └── Email Links (Nodemailer)
             │
             ▼
          Vendor
             │
         HTTPS (ngrok)
             ▼
      Vendor Form (HTML)
```

---

## **Folder Structure**

```
Acquisory-TPRM/
│
├─ server.js                # Express API, auth, email, uploads
├─ public/
│  ├─ admin.html            # Admin dashboard & question management
│  ├─ vendor.html           # Vendor questionnaire form
│  ├─ vendors.html          # Vendor master management
│  ├─ pending.html          # Incomplete / due response tracker
│  └─ export.html           # CSV export (vendors & responses)
├─ uploads/                 # Evidence files
├─ package.json
├─ .env                     # Secrets & configuration
└─ tprm.db                  # SQLite database (auto-created)
```

---

## **Setup (Under 5 Minutes)**

```bash
npm init -y
npm install express sqlite3 multer nodemailer bcrypt jsonwebtoken dotenv cors helmet
```

### Configure `.env`

```env
PORT=4000
JWT_SECRET=strong-secret-key
GMAIL_USER=your@gmail.com
GMAIL_PASS=your-app-password
```

### Start Server

```bash
node server.js
```

### Optional: Enable Vendor External Access

```bash
ngrok http 4000
```

---

## **User Workflows**

### **Admin Flow**

1. Upload vendors (CSV or manual)
2. Upload and manage questions
3. Generate secure vendor links
4. Monitor dashboard:

   * Completed
   * Incomplete
   * Evidence pending
5. Export reports (CSV)

---

### **Vendor Flow**

1. Receive email with secure link
2. Open questionnaire (no login required)
3. Submit responses + evidence
4. Save draft or finalize submission

---

## **API Endpoints**

| Method | Endpoint                | Role   | Description          |
| ------ | ----------------------- | ------ | -------------------- |
| POST   | `/api/login`            | Admin  | Authenticate admin   |
| POST   | `/api/vendors`          | Admin  | Create vendors       |
| POST   | `/api/questions/upload` | Admin  | Bulk upload controls |
| POST   | `/api/generate-link`    | Admin  | Generate vendor URL  |
| GET    | `/vendor/:token`        | Vendor | Load questionnaire   |
| POST   | `/api/response`         | Vendor | Submit responses     |
| GET    | `/api/pending`          | Admin  | Incomplete tracking  |
| GET    | `/api/export`           | Admin  | CSV export           |

---

## **Operational Benefits**

* No heavy frontend frameworks
* No cloud lock-in
* Offline-friendly SQLite
* Easy audits & evidence review
* Low cost, low complexity

---

## **License & Usage**

Internal risk assessments, vendor compliance checks, and audit readiness.

---

## **Next-Phase Enhancements (Optional)**

* Role-based dashboards
* Evidence preview & OCR
* Vendor risk scoring engine
* Scheduled reminder emails
* Database encryption
* SSO (SAML / OAuth)

---

