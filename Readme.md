# **Acquisory TPRM – Vendor Risk Assessment Platform** v3.0 **(100% COMPLETE)**

**Production-ready Third-Party Risk Management (TPRM) platform** with **FULL CRUD**, vendor assessments, file uploads, CSV exports, user management, and real-time risk scoring.

✅ **100% Self-hosted** | ✅ **Production Secure** | ✅ **All Tabs Documented**

***

## **🚀 Quick Start (2 Minutes)**

```bash
npm install express bcrypt jsonwebtoken sqlite3 helmet cors multer express-rate-limit nodemailer dotenv
node server.js
```

**Login:** `http://localhost:4000` → **admin** / **admin123**

***

## **📱 Frontend Tabs - What Each Does**

| Tab | URL | Purpose | Key Features | Endpoints |
|-----|-----|---------|--------------|-----------|
| **Dashboard** | `/dashboard` | **Overview & Stats** | Total vendors, completion %, high-risk count, avg risk score | `GET /api/dashboard` |
| **Vendors** | `/vendors` | **Vendor CRUD** | Add/edit/delete vendors, bulk upload, search/filter, risk levels | `GET/POST/PUT/DELETE /api/vendors*` |
| **Users** | `/users` | **User Management** | Create admin/reviewers, list users, delete users, roles | `GET/POST/DELETE /api/users*` |
| **Pending** | `/pending` | **Track Incomplete** | Shows vendors/controls with gaps: "Not Responded", "Evidence Pending", "Justification Pending" | `GET /api/pending-responses` |
| **Risk** | `/risks` | **Risk Overview** | Color-coded risk levels (Low/Green, Medium/Yellow, High/Red), prioritize follow-ups | Risk calc in `/api/vendors` |
| **Settings** | `/settings` | **Config & Questions** | Edit TPRM questions, email status, file size limits, database info | `GET /api/settings` |
| **Export** | `/export` | **CSV Downloads** | vendors.csv (all fields), control_responses.csv (evidence tracking) | `GET /api/export/*` |

***

## **🔐 Security & Production Features**

- **JWT Authentication** + Admin roles
- **Rate Limiting** (Login:5, API:100, Vendors:50/hr)
- **File Uploads** (PDF/DOCX/XLSX/JPG/PNG - 25MB max)
- **CORS** + Helmet CSP
- **SQL Injection Safe** parameterized queries
- **Graceful Shutdown** + SQLite indexing

***

## **🛠️ Technology Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Node.js + Express | REST API Server |
| **Database** | SQLite3 | Production TPRM Data |
| **Authentication** | JWT + bcrypt | Admin Role Security |
| **File Uploads** | Multer | Evidence Documents |
| **Security** | Helmet + CORS | CSP + Cross-Origin |
| **Rate Limiting** | express-rate-limit | API Protection |

***

## **🌐 Complete API Reference**

### **Authentication & Users**
```
POST  /api/login              # admin/admin123
GET   /api/users              # List all users → /users tab
POST  /api/users              # {username, password, role="user"}
DELETE /api/users/:id         # Delete user → /users tab
```

### **Vendors (Full CRUD)**
```
GET   /api/vendors            # ?search=abc&status=pending → /vendors tab
POST  /api/vendors            # Bulk: {vendors: [{name,email,domain,...}]}
PUT   /api/vendors/:id        # Update vendor → /vendors tab
DELETE /api/vendors/:id       # Delete vendor → /vendors tab
```

### **Dashboard & Analytics**
```
GET /api/dashboard            # Stats → /dashboard tab
GET /api/pending-responses    # Incomplete tracking → /pending tab
```

### **Exports**
```
GET /api/export/vendors       # vendors.csv → /export tab
GET /api/export/responses     # control_responses.csv → /export tab
```

### **Vendor Assessment**
```
POST  /api/generate-link      # Email secure URL → /vendors tab
GET   /api/vendor/:vendorId   # Load questions for vendor
POST  /api/vendor/:vendorId/respond  # Submit + files
```

***

## **📁 Folder Structure**

```
project/
├── server.js                 # ✅ COMPLETE API
├── package.json             # ✅ Auto-generated
├── tprm-production.db       # ✅ Auto-created
├── uploads/                 # ✅ Evidence files
├── public/                  # ✅ SPA HTML files (all tabs)
└── .env                     # Optional config
```

***

## **✅ Server Startup**

```
🚀 Acquisory TPRM PRODUCTION v3.0 - 100% COMPLETE
📍 Server:      http://localhost:4000
👤 Login:      admin / admin123
📊 Dashboard:  http://localhost:4000/dashboard
🏢 Vendors:    http://localhost:4000/vendors  ← Full CRUD
👥 Users:      http://localhost:4000/users    ← User management
❌ Pending:    http://localhost:4000/pending  ← Track gaps
⚙️  Settings:  http://localhost:4000/settings ← Config
```

***

**🎉 NOW 100% COMPLETE - Every tab's purpose, features, and endpoints documented!**