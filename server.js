const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = new sqlite3.Database('./database.sqlite', err => {
  if(err) console.error(err);
  else console.log('Connected to SQLite DB');
});

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Helper
function runAsync(sql, params=[]) {
  return new Promise((resolve,reject)=> {
    db.run(sql, params, function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// --- Tables
db.run(`CREATE TABLE IF NOT EXISTS audit_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  control_name TEXT,
  question TEXT,
  reference TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER,
  evidence TEXT,
  evidence_name TEXT,
  remark TEXT,
  created_at TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  image BLOB
)`);

// --- APIs
app.get('/questions', (req,res) => {
  db.all('SELECT id, control_name AS domain, question, reference FROM audit_questions', [], (err, rows)=>{
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/questions', async (req,res)=>{
  const { control_name, question, reference } = req.body;
  if(!control_name || !question) return res.status(400).json({error:"Control/Question required"});
  try {
    const id = await runAsync('INSERT INTO audit_questions(control_name, question, reference) VALUES (?,?,?)', [control_name, question, reference]);
    res.json({id, control_name, question, reference});
  } catch(err){ res.status(500).json({error: err.message}); }
});

app.delete('/questions/:id', (req,res)=>{
  db.run('DELETE FROM audit_questions WHERE id=?', [req.params.id], function(err){
    if(err) return res.status(500).json({error: err.message});
    res.json({deleted:true});
  });
});

// --- Responses upload
app.post('/responses', upload.single('evidence'), async (req,res)=>{
  try {
    const { question_id, remark } = req.body;
    if(!req.file) return res.status(400).json({error:'Evidence required'});
    const evidence_name = req.file.originalname;
    const evidence_path = req.file.path;

    await runAsync('INSERT INTO responses(question_id, evidence, evidence_name, remark, created_at) VALUES (?,?,?,?,?)',
      [question_id, evidence_path, evidence_name, remark, new Date().toISOString()]
    );

    res.json({success:true});
  } catch(err){ res.status(500).json({error: err.message}); }
});

// --- Logo upload
app.post('/logos', upload.single('logo'), async (req,res)=>{
  const { type } = req.body;
  if(!req.file || !type) return res.status(400).json({error:"Type & file required"});
  const image = fs.readFileSync(req.file.path);
  fs.unlinkSync(req.file.path);

  db.get('SELECT id FROM logos WHERE type=?', [type], async (err,row)=>{
    if(err) return res.status(500).json({error:err.message});
    try {
      if(row) await runAsync('UPDATE logos SET image=? WHERE type=?', [image,type]);
      else await runAsync('INSERT INTO logos(type,image) VALUES(?,?)', [type,image]);
      res.json({success:true});
    } catch(err){ res.status(500).json({error: err.message}); }
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, ()=> console.log(`Server running at http://localhost:${PORT}`));
