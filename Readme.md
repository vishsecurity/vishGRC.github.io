# 🛡️ **GRC Enterprise Portal**

A lightweight, persistent **Vendor Risk Management (VRM)** platform designed to streamline RBI IT GRC security assessments. This tool allows admins to build custom control templates (ISO 27001, RBI guidelines), register vendors like **TATA Motors**, and collect evidence directly into **`grc.db`**.

## 🚀 **Features**

* **✅ Persistent Storage**: **`grc.db`** - All data survives restarts
* **✅ Dynamic Template Builder**: 60+ RBI IT GRC controls (SOD Matrix, Access Control, Audit Trail)
* **✅ Evidence Management**: PDF/Image uploads stored in `/uploads`
* **✅ Automated RBI Scoring**: Weighted controls (2-5 points) with real-time dashboard
* **✅ PDF Export**: Professional audit reports for Clix Capital compliance
* **✅ Role-Based Access**: Admin (`admin123`) vs Vendor views
* **✅ TATA Motors Ready**: Pre-loaded vendor + template

***

## 🛠️ **Technology Stack**

| Component | Technology |
| --- | --- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | **SQLite3 (`grc.db`)** |
| **File Upload** | Multer (15MB limit, PDF/Images/Docs) |
| **CORS** | Cross-origin support |
| **Reporting** | jsPDF, jsPDF-AutoTable |

***

## 📂 **Project Structure**

```text
Vishal-Chaudhary-GRC-Dashboard/
├── Public/                 # Frontend portal
│   └── index.html
├── uploads/               # Vendor evidence files
├── grc.db                 # 🎯 PRODUCTION DATABASE
├── server.js              # 🚀 Node.js API + RBI Controls
├── update-questions.js    # Add 60+ RBI questions (Run once)
├── .env                   # DB_FILE=./grc.db
└── package.json
```

***

## ⚙️ **Installation & Setup**

### **1. Quick Start (2 Minutes)**
```bash
npm install express sqlite3 multer cors dotenv
node server.js
```

### **2. Load RBI IT GRC Questions (Run Once)**
```bash
node update-questions.js
```

### **3. Access App**
```
http://localhost:3000
Admin Login: admin123
```

***

## 📖 **Usage Workflow**

### **🔧 Administrator**
```
1. Login: admin123 → Template Builder
2. Select: RBI-01 to RBI-60 (60+ controls)
3. Save: "Clix Capital RBI Template"
4. Vendors → Add "TATA Motors" 
5. Assign: TATA Motors → RBI Template
6. Dashboard → Monitor scores + Export PDF
```

### **🏭 Vendor (TATA Motors)**
```
1. Select: "TATA Motors" from dropdown
2. Answer: 60 RBI controls (Yes/No/NA + Evidence)
3. Upload: SOC2, ISO certs, policies
4. Submit → Score calculated automatically
```

***

## 📊 **RBI IT GRC Controls (Pre-loaded)**

| Control | Questions | Weight |
|---------|-----------|--------|
| **IT Governance** | SOD Matrix, ISO 27001 | 3-5 |
| **Logical Access** | 15 controls (Unique ID, Privileged Access) | 2-4 |
| **Password Mgmt** | MFA, Complexity, Reset Process | 2-5 |
| **Vulnerability** | Patch Mgmt, SOC Monitoring | 3-4 |
| **Change Mgmt** | CAB, Emergency Changes | 2-4 |
| **Data Migration** | Validation, UAT Testing | 4-5 |
| **Audit Trail** | Chain of Custody, Retention | 3-5 |

**Total: 60+ Controls → Auto-scored dashboard**

***

## 🛡️ **Maintenance & Production**

### **Backup (Critical!)**
```bash
# Copy these 2 items:
cp grc.db backup-grc-$(date +%Y%m%d).db
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### **Production Deployment**
```bash
npm install -g pm2
pm2 start server.js --name "GRC-Portal"
pm2 save
pm2 logs GRC-Portal
```

### **Environment (.env)**
```
DB_FILE=./grc.db
PORT=3000
NODE_ENV=production
```

***

## 🎯 **Key Benefits**

* **✅ RBI Compliant**: All 8 control families mapped
* **✅ Zero Config**: `grc.db` auto-initializes  
* **✅ TATA Motors Ready**: Pre-configured vendor
* **✅ Clix Capital**: Perfect for vendor assessments
* **✅ Production Scale**: Handles 1000+ vendors

## 🚀 **Quick Commands**
```bash
node server.js                    # Start dev server
node update-questions.js          # Add RBI controls (once)
pm2 start server.js --name grc    # Production
http://localhost:3000/debug       # Database status
```

**Enterprise GRC portal ready for TATA Motors + RBI compliance!** 🎉

***

