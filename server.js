// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
    if(err) { console.error(err.message); process.exit(1); }
    console.log("Connected to SQLite DB");
});

// --- Create Logos Table if not exists ---
db.run(`CREATE TABLE IF NOT EXISTS logos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT UNIQUE,
    image BLOB
)`);

// Helper for async run
function runAsync(sql, params=[]) {
    return new Promise((resolve,reject)=> {
        db.run(sql, params, function(err) {
            if(err) reject(err);
            else resolve(this.lastID);
        });
    });
}

// --- Questions Routes using audit_questions ---
app.get('/questions', (req,res) => {
    db.all('SELECT id, control_name, question, reference FROM audit_questions', [], (err, rows) => {
        if(err) return res.status(500).json({error:err.message});
        // Map control_name as domain for frontend
        const data = rows.map(r => ({
            id: r.id,
            control_group: r.control_name,
            question: r.question,
            reference: r.reference,
            domain: r.control_name
        }));
        res.json(data);
    });
});

app.post('/questions', async (req,res) => {
    const { control_group, question, reference } = req.body;
    if(!control_group || !question) return res.status(400).json({error:"Control Group and Question required"});
    try {
        const id = await runAsync(
            'INSERT INTO audit_questions(control_name, question, reference) VALUES(?,?,?)',
            [control_group, question, reference]
        );
        res.json({id, control_group, question, reference, domain: control_group});
    } catch(err) {
        res.status(500).json({error:err.message});
    }
});

// DELETE question
app.delete('/questions/:id', (req,res)=>{
    const id = req.params.id;
    db.run('DELETE FROM audit_questions WHERE id=?',[id], function(err){
        if(err) return res.status(500).json({error:err.message});
        res.json({deleted:true});
    });
});

// --- Send Questions via Email with dynamic sender ---
app.post('/send-questions', async (req,res)=>{
    const { email, questionIds, senderEmail, senderPass } = req.body;
    if(!email || !Array.isArray(questionIds) || questionIds.length===0) 
        return res.status(400).json({error:"Recipient email and questionIds required"});
    if(!senderEmail || !senderPass)
        return res.status(400).json({error:"Sender email and password required"});

    db.all(
        `SELECT id, control_name, question, reference FROM audit_questions WHERE id IN (${questionIds.map(()=>'?').join(',')})`,
        questionIds,
        async (err, rows)=>{
            if(err) return res.status(500).json({error:err.message});
            if(rows.length===0) return res.status(404).json({error:"No questions found"});

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: senderEmail, pass: senderPass }
            });

            const html = rows.map(q=>`<b>${q.control_name}</b>: ${q.question}<br>Reference: ${q.reference || ''}<br><br>`).join('');
            try {
                await transporter.sendMail({
                    from: `"GRC Dashboard" <${senderEmail}>`,
                    to: email,
                    subject: "Selected Questions from GRC Dashboard",
                    html
                });
                res.json({sent: rows.length});
            } catch(error) {
                console.error("Email sending failed:", error);
                res.status(500).json({error: error.message});
            }
        }
    );
});

// --- Logo Upload ---
const upload = multer({ dest: 'uploads/' });
app.post('/logos', upload.single('logo'), async (req,res)=>{
    const type = req.body.type;
    if(!type || !req.file) return res.status(400).json({error:"Type and file required"});
    const image = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);

    db.get('SELECT id FROM logos WHERE type=?',[type], async (err,row)=>{
        if(err) return res.status(500).json({error:err.message});
        try{
            if(row){
                await runAsync('UPDATE logos SET image=? WHERE type=?',[image,type]);
            } else {
                await runAsync('INSERT INTO logos(type,image) VALUES(?,?)',[type,image]);
            }
            res.json({success:true});
        } catch(err){ res.status(500).json({error:err.message}); }
    });
});

// --- Bulk Excel Upload placeholder ---
app.post('/upload-excel', (req,res)=>{
    res.json({inserted:0, message:"Implement Excel parsing here."});
});

const PORT = 3000;
app.listen(PORT, ()=> console.log(`Server running at http://localhost:${PORT}`));
