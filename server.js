require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_FILE || './grc.db');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- SERVING STATIC FILES ---
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// --- DATABASE INITIALIZATION (COMPLETE) ---
db.serialize(() => {
    console.log('🛠 Initializing CyberVendor Database...');
    
    // 1. QUESTIONS (Master Control Bank)
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        question TEXT NOT NULL,
        weight INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. TEMPLATES (Admin creates these)
    db.run(`CREATE TABLE IF NOT EXISTS templates (
        name TEXT PRIMARY KEY,
        controlIds TEXT NOT NULL
    )`);

    // 3. VENDORS (TATA Motors + others)
    db.run(`CREATE TABLE IF NOT EXISTS vendors (
        name TEXT PRIMARY KEY,
        templateName TEXT DEFAULT 'Not Assigned',
        score INTEGER DEFAULT 0,
        activeIds TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. AUDIT RESPONSES (Vendor submissions)
    db.run(`CREATE TABLE IF NOT EXISTS audit_responses (
        vendorName TEXT,
        controlId TEXT,
        response TEXT,
        remark TEXT,
        fileName TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (vendorName, controlId)
    )`);

    // 🔥 SEED COMPLETE DATASET
    db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
        if (row && row.count === 0) {
            console.log('🌱 Seeding TATA Motors Questions...');
            const tataQuestions = [
                ['TM-01', 'MFA Enforcement', 'Is Multi-Factor Authentication mandatory for all Tata Motors employees and vendors?', 4],
                ['TM-02', 'Data Encryption', 'Are all Tata Motors production data encrypted at rest (AES-256) and in transit (TLS 1.3)?', 5],
                ['TM-03', 'Endpoint Security', 'Do all Tata Motors endpoints have EDR (Endpoint Detection Response) deployed?', 3],
                ['TM-04', 'Physical Security', 'Are Tata Motors manufacturing facilities protected with biometric access controls?', 2],
                ['TM-05', 'Vendor Risk', 'Does Tata Motors conduct quarterly security assessments of Tier-1 suppliers?', 3],
                ['TM-06', 'Incident Response', 'Is Tata Motors IR plan tested quarterly with tabletop exercises?', 3],
                ['TM-07', 'SOC2 Compliance', 'Can you provide current SOC2 Type II report covering last 12 months?', 4],
                ['TM-08', 'Patch Management', 'Are all Tata Motors systems patched within 30 days of critical vulnerabilities?', 2],
                ['TM-09', 'SIEM Monitoring', 'Does Tata Motors have 24x7 SIEM with automated threat hunting?', 4],
                ['TM-10', 'Backup Validation', 'Are Tata Motors backups tested quarterly for ransomware recovery?', 3]
            ];
            
            const stmt = db.prepare("INSERT INTO questions (id, name, question, weight) VALUES (?, ?, ?, ?)");
            tataQuestions.forEach(q => stmt.run(q));
            stmt.finalize(() => console.log('✅ TATA Motors questions seeded!'));
        }
    });

    // 🔥 SEED TATA MOTOR DEFAULT VENDOR
    db.get("SELECT COUNT(*) as count FROM vendors WHERE name = 'TATA Motors'", (err, row) => {
        if (row && row.count === 0) {
            console.log('🏭 Seeding TATA Motors vendor...');
            db.run("INSERT INTO vendors (name, templateName, score, activeIds) VALUES (?, 'TATA Motors Standard', 0, '[]')", ['TATA Motors']);
        }
    });

    // 🔥 SEED TATA DEFAULT TEMPLATE
    db.get("SELECT COUNT(*) as count FROM templates WHERE name = 'TATA Motors Standard'", (err, row) => {
        if (row && row.count === 0) {
            console.log('📋 Seeding TATA Motors template...');
            db.run("INSERT INTO templates VALUES (?, ?)", [
                'TATA Motors Standard',
                JSON.stringify(['TM-01','TM-02','TM-03','TM-04','TM-05','TM-06','TM-07','TM-08','TM-09','TM-10'])
            ]);
        }
    });
});

// --- SECURE FILE UPLOADS ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only Images, PDFs, Word docs allowed'), false);
    }
});

// --- COMPLETE API ROUTES ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// 📊 DASHBOARD DATA (All sections)
app.get('/api/dashboard', (req, res) => {
    Promise.all([
        db.all("SELECT * FROM questions ORDER BY id"),
        db.all("SELECT * FROM templates ORDER BY name"),
        db.all("SELECT * FROM vendors ORDER BY name"),
        db.all("SELECT COUNT(*) as totalAudits FROM audit_responses")
    ]).then(([questions, templates, vendors, audits]) => {
        res.json({
            questions: questions || [],
            templates: templates || [],
            vendors: vendors || [],
            stats: {
                totalQuestions: questions?.length || 0,
                totalTemplates: templates?.length || 0,
                totalVendors: vendors?.length || 0,
                totalAudits: audits?.[0]?.totalAudits || 0
            }
        });
    });
});

// 🔍 QUESTIONS API
app.get('/api/questions', (req, res) => {
    db.all("SELECT * FROM questions ORDER BY id", (err, rows) => res.json(rows || []));
});

app.post('/api/questions/:id/update', (req, res) => {
    const { name, question, weight } = req.body;
    db.run("UPDATE questions SET name = ?, question = ?, weight = ? WHERE id = ?", 
           [name, question, parseInt(weight), req.params.id], 
           function(err) { res.json({ success: true, changes: this.changes }); });
});

// 📋 TEMPLATES API
app.get('/api/templates', (req, res) => {
    db.all("SELECT * FROM templates ORDER BY name", (err, rows) => res.json(rows || []));
});

app.post('/api/templates', (req, res) => {
    const { name, controlIds } = req.body;
    db.run("INSERT OR REPLACE INTO templates VALUES (?, ?)", [name, JSON.stringify(controlIds)], () => res.json({ success: true }));
});

// 🏭 VENDORS API (TATA Motors Ready)
app.get('/api/vendors', (req, res) => {
    db.all("SELECT * FROM vendors ORDER BY name", (err, rows) => res.json(rows || []));
});

app.post('/api/vendors', (req, res) => {
    const { name } = req.body;
    db.run("INSERT OR IGNORE INTO vendors (name, templateName, score, activeIds) VALUES (?, 'Not Assigned', 0, '[]')", [name], 
           function(err) { res.json({ success: true, id: this.lastID }); });
});

app.delete('/api/vendors/:name', (req, res) => {
    const name = req.params.name;
    db.serialize(() => {
        db.run("DELETE FROM vendors WHERE name = ?", [name]);
        db.run("DELETE FROM audit_responses WHERE vendorName = ?", [name], () => res.json({ success: true }));
    });
});

// 📊 ASSIGN TEMPLATE
app.post('/api/assign-template', (req, res) => {
    const { vendorName, templateName, activeIds } = req.body;
    db.run("UPDATE vendors SET templateName = ?, activeIds = ? WHERE name = ?", 
           [templateName, JSON.stringify(activeIds), vendorName], () => res.json({ success: true }));
});

// 📋 AUDIT DATA
app.get('/api/audit/:vendorName', (req, res) => {
    db.all("SELECT * FROM audit_responses WHERE vendorName = ? ORDER BY controlId", [req.params.vendorName], (err, rows) => res.json(rows || []));
});

// 💾 SAVE AUDIT + FILES
app.post('/api/audit/save', upload.any(), (req, res) => {
    const { vendorName, score, responses } = req.body;
    const parsedResponses = JSON.parse(responses);
    
    db.serialize(() => {
        db.run("UPDATE vendors SET score = ? WHERE name = ?", [score, vendorName]);
        const stmt = db.prepare("INSERT OR REPLACE INTO audit_responses VALUES (?, ?, ?, ?, ?)");
        parsedResponses.forEach(r => {
            const file = req.files.find(f => f.fieldname === `file-${r.id}`);
            stmt.run(vendorName, r.id, r.res, r.rem, file ? file.filename : r.existingFile);
        });
        stmt.finalize(() => res.json({ success: true }));
    });
});

// 🐛 DEBUG (Remove in production)
app.get('/debug', (req, res) => {
    db.all(".tables", (err, tables) => {
        db.all("SELECT COUNT(*) as q, COUNT(*) as v, COUNT(*) as t FROM questions, vendors, templates", (err, stats) => {
            res.json({ 
                tables: tables?.toString(), 
                status: '🚀 TATA Motors CyberVendor READY!',
                questions: stats[0]?.q || 0,
                vendors: stats[0]?.v || 0,
                templates: stats[0]?.t || 0
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 TATA Motors CyberVendor running: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/debug`);
    console.log(`🏭 TATA Motors vendor pre-loaded!`);
});
