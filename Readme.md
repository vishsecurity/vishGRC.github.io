# 🛡️ CyberVendor Enterprise Portal

A lightweight, persistent Vendor Risk Management (VRM) platform designed to streamline security assessments. This tool allows admins to build custom control templates, register vendors, and collect evidence directly into a permanent SQLite database.

## 🚀 Features

* **Persistent Storage**: Powered by SQLite—no data is lost on browser refresh or server restart.
* **Dynamic Template Builder**: Create specific questionnaires (e.g., "High Risk," "SaaS") from a master control bank.
* **Evidence Management**: Vendors can upload files (PDFs, images) which are stored locally on the server.
* **Automated Scoring**: Real-time risk scoring based on weighted control values.
* **PDF Reporting**: Generate professional audit reports for compliance records.
* **Role-Based Views**: Separate interfaces for Administrators and Vendors.

---

## 🛠️ Technology Stack

| Component | Technology |
| --- | --- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 |
| **File Handling** | Multer |
| **Reporting** | jsPDF, jsPDF-AutoTable |

---

## 📂 Project Structure

```text
cybervendor-portal/
├── Public/
│   └── index.html      # Frontend portal & logic
├── uploads/            # Folder for vendor evidence files
├── server.js           # Node.js API & SQLite configuration
├── cybervendor.db      # The SQLite database file (auto-generated)
├── .env                # Environment variables (Port, DB file path)
└── package.json        # Project dependencies

```

---

## ⚙️ Installation & Setup

1. **Install Node.js**: Ensure you have Node.js installed on your machine.
2. **Initialize Project**:
```bash
npm install

```


3. **Install Dependencies**:
```bash
npm install express sqlite3 multer cors dotenv

```


4. **Run the Server**:
```bash
node server.js

```


5. **Access the App**: Open your browser and go to `http://localhost:3000`.

---

## 📖 How to Use

### For Administrators

1. **Auth**: Log in with the default password (`admin123`).
2. **Build**: Select controls in the **Template Builder**, name it, and save.
3. **Register**: Add a new company in the **Vendor Inventory**.
4. **Assign**: Select a vendor card, then click a "Saved Template" button to assign those questions.
5. **Audit**: Review vendor responses and evidence, then click **Export PDF** to save the final result.

### For Vendors

1. Select your organization from the **Vendor Login** dropdown.
2. Complete the assigned security questions.
3. Upload required documents (SOC2, Privacy Policy, etc.).
4. Click **Submit Assessment**.

---

## 🛡️ Maintenance & Backup

* **Backup**: Simply copy the `cybervendor.db` file and the `/uploads` folder to a secure location.
* **Deployment**: To keep the app running 24/7, use **PM2**:
```bash
npm install -g pm2
pm2 start server.js --name "cybervendor"
pm2 save

```
