require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || './cybervendor.db');

app.use(cors());
app.use(express.json());

// --- SERVING STATIC FILES ---
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// --- DATABASE INITIALIZATION ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS vendors (
        name TEXT PRIMARY KEY,
        templateName TEXT,
        score INTEGER DEFAULT 0,
        activeIds TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS templates (
        name TEXT PRIMARY KEY,
        controlIds TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS audit_responses (
        vendorName TEXT,
        controlId TEXT,
        response TEXT,
        remark TEXT,
        fileName TEXT,
        PRIMARY KEY (vendorName, controlId)
    )`);
});

// --- FILE UPLOAD CONFIGURATION ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- API ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// Templates API
app.get('/api/templates', (req, res) => {
    db.all("SELECT * FROM templates", [], (err, rows) => res.json(rows));
});

app.post('/api/templates', (req, res) => {
    const { name, controlIds } = req.body;
    db.run("INSERT OR REPLACE INTO templates VALUES (?, ?)", [name, JSON.stringify(controlIds)], () => res.sendStatus(200));
});

// Vendors API
app.get('/api/vendors', (req, res) => {
    db.all("SELECT * FROM vendors", [], (err, rows) => res.json(rows));
});

app.post('/api/vendors', (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO vendors (name, templateName, score, activeIds) VALUES (?, 'Not Assigned', 0, '[]')", [name], (err) => {
        if (err) return res.status(400).json({ error: "Vendor exists" });
        res.sendStatus(200);
    });
});

// New Delete Vendor Route
app.delete('/api/vendors/:name', (req, res) => {
    const name = req.params.name;
    db.serialize(() => {
        // Remove vendor record
        db.run("DELETE FROM vendors WHERE name = ?", [name]);
        // Clean up their audit responses
        db.run("DELETE FROM audit_responses WHERE vendorName = ?", [name], (err) => {
            if (err) return res.status(500).send(err);
            res.sendStatus(200);
        });
    });
});

app.post('/api/assign-template', (req, res) => {
    const { vendorName, templateName, activeIds } = req.body;
    db.run("UPDATE vendors SET templateName = ?, activeIds = ? WHERE name = ?", [templateName, JSON.stringify(activeIds), vendorName], () => res.sendStatus(200));
});

// Audit Data API
app.get('/api/audit/:vendorName', (req, res) => {
    db.all("SELECT * FROM audit_responses WHERE vendorName = ?", [req.params.vendorName], (err, rows) => res.json(rows));
});

// Save Audit & Upload Files
app.post('/api/audit/save', upload.any(), (req, res) => {
    const { vendorName, score, responses } = req.body;
    const parsedResponses = JSON.parse(responses);
    
    db.serialize(() => {
        db.run("UPDATE vendors SET score = ? WHERE name = ?", [score, vendorName]);
        const stmt = db.prepare("INSERT OR REPLACE INTO audit_responses VALUES (?, ?, ?, ?, ?)");
        parsedResponses.forEach(r => {
            const file = req.files.find(f => f.fieldname === `file-${r.id}`);
            const finalFileName = file ? file.filename : r.existingFile;
            stmt.run(vendorName, r.id, r.res, r.rem, finalFileName);
        });
        stmt.finalize(() => res.sendStatus(200));
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📂 Public folder: ${path.join(__dirname, 'Public')}`);
});