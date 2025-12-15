require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const morgan = require('morgan');
const cron = require('node-cron');

// Check required env variables
['JWT_SECRET', 'SMTP_USER', 'SMTP_PASS'].forEach(key => {
  if (!process.env[key]) { console.error(`Missing env: ${key}`); process.exit(1); }
});

const app = express();
const PORT = process.env.PORT || 4000;
const db = new sqlite3.Database('./tprm.db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5500', credentials: true }));
app.use(helmet());
app.use(morgan('combined'));

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use(limiter);

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads', { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 10*1024*1024 },
  fileFilter: (req,file,cb) => {
    const allowed = /pdf|doc|docx|jpg|png|jpeg/;
    if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null,true);
    cb(new Error('Only PDF, Word, images allowed'));
  }
});

const validate = (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const authenticateToken = (req,res,next)=>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
    if(err) return res.sendStatus(403);
    req.user=user;
    next();
  });
};

const authorizeRoles = (...roles) => (req,res,next)=>{
  if(!roles.includes(req.user.role)) return res.status(403).json({error:'Insufficient permissions'});
  next();
};

// DB setup
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    type TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS audit_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_name TEXT,
    question TEXT,
    reference TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER,
    question_id INTEGER,
    remark TEXT,
    evidence TEXT,
    evidence_name TEXT,
    approved INTEGER DEFAULT 0
  )`);
  db.run('CREATE INDEX IF NOT EXISTS idx_responses_vendor ON responses(vendor_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id)');

  // Seed default admin
  db.get('SELECT COUNT(*) as cnt FROM users', (err,row)=>{
    if(row?.cnt===0){
      bcrypt.hash('admin123',10,(err,hash)=>{
        if(!err){
          db.run('INSERT INTO users (username,password,role) VALUES (?,?,?)', ['admin',hash,'admin']);
          console.log('Created default admin: admin/admin123');
        }
      });
    }
  });

  // Seed sample question
  db.get('SELECT COUNT(*) as cnt FROM audit_questions', (err,row)=>{
    if(row?.cnt===0){
      db.run("INSERT INTO audit_questions (control_name,question,reference) VALUES (?,?,?)", ['General','Platform technical details?','ISO 27001']);
    }
  });
});

// Response time logging
app.use((req,res,next)=>{
  const start=Date.now();
  res.on('finish',()=>{ console.log(`${req.method} ${req.originalUrl} - ${Date.now()-start}ms`); });
  next();
});

// --- LOGIN ---
app.post('/login', body('username').trim().notEmpty(), body('password').notEmpty(), validate, (req,res)=>{
  const { username,password } = req.body;
  db.get('SELECT * FROM users WHERE username=?',[username],(err,user)=>{
    if(err||!user) return res.status(401).json({error:'Invalid credentials'});
    bcrypt.compare(password,user.password,(err,match)=>{
      if(!match) return res.status(401).json({error:'Invalid credentials'});
      const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'8h'});
      res.json({token, role:user.role, id:user.id});
    });
  });
});

app.post('/vendor-login', body('email').isEmail(), validate, (req,res)=>{
  const { email } = req.body;
  db.get('SELECT * FROM vendors WHERE email=?',[email],(err,vendor)=>{
    if(!vendor) return res.status(401).json({error:'Vendor not found'});
    const token = jwt.sign({id:vendor.id,role:'vendor'},process.env.JWT_SECRET,{expiresIn:'8h'});
    res.json({token, role:'vendor', id:vendor.id});
  });
});

// --- VENDORS CRUD ---
app.post('/vendors', authenticateToken, authorizeRoles('admin'),
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('type').isIn(['vendor','client']),
  validate,
  (req,res)=>{
    const { name,email,type } = req.body;
    db.run('INSERT INTO vendors (name,email,type) VALUES (?,?,?)',[name,email,type], function(err){
      if(err) return res.status(500).json({error:err.message});
      res.json({id:this.lastID,name,email});
    });
  }
);
app.get('/vendors', authenticateToken, authorizeRoles('admin'), (req,res)=>{
  db.all('SELECT * FROM vendors', (err,rows)=>{ if(err) return res.status(500).json({error:err.message}); res.json(rows); });
});
app.get('/vendors/:id', authenticateToken, authorizeRoles('admin','vendor'), (req,res)=>{
  db.get('SELECT * FROM vendors WHERE id=?',[req.params.id],(err,vendor)=>{ if(err||!vendor) return res.status(404).json({error:'Vendor not found'}); res.json(vendor); });
});

// --- QUESTIONS ---
app.get('/questions', authenticateToken, authorizeRoles('vendor','admin','auditor'), (req,res)=>{
  db.all('SELECT * FROM audit_questions ORDER BY control_name',(err,rows)=>{ if(err) return res.status(500).json({error:err.message}); res.json(rows); });
});

// --- RESPONSES ---
app.post('/responses', authenticateToken, authorizeRoles('vendor'), upload.single('evidence'),
  body('question_id').isInt(), body('remark').optional().trim(), validate, (req,res)=>{
    const { question_id, remark } = req.body;
    db.get('SELECT id FROM responses WHERE vendor_id=? AND question_id=?', [req.user.id, question_id], (err, existing)=>{
      if(existing) return res.status(400).json({error:'Already submitted'});
      const evidence = req.file?.filename;
      const evidence_name = req.file?.originalname;
      db.run('INSERT INTO responses (vendor_id,question_id,remark,evidence,evidence_name) VALUES (?,?,?,?,?)',
        [req.user.id, question_id, remark, evidence, evidence_name], function(err){
          if(err) return res.status(500).json({error:err.message});
          res.json({id:this.lastID});
        });
    });
  }
);

app.get('/responses', authenticateToken, authorizeRoles('admin','auditor'), (req,res)=>{
  const { vendor_id } = req.query;
  let sql=`SELECT r.*, v.name as vendor_name, q.question, q.control_name
           FROM responses r
           JOIN vendors v ON r.vendor_id=v.id
           JOIN audit_questions q ON r.question_id=q.id`;
  const params=[];
  if(vendor_id){sql+=' WHERE r.vendor_id=?'; params.push(vendor_id);}
  db.all(sql,params,(err,rows)=>{ if(err) return res.status(500).json({error:err.message}); res.json(rows); });
});

// --- APPROVE ---
app.put('/responses/:id/approve', authenticateToken, authorizeRoles('admin'), (req,res)=>{
  db.run('UPDATE responses SET approved=1 WHERE id=?',[req.params.id], function(err){
    if(err) return res.status(500).json({error:err.message});
    res.json({success:true});
  });
});

// --- SEND QUESTIONNAIRE ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure:false,
  auth:{user:process.env.SMTP_USER, pass:process.env.SMTP_PASS}
});
app.post('/send-questionnaire', authenticateToken, authorizeRoles('admin'),
  body('vendor_id').isInt(), validate,
  (req,res)=>{
    const { vendor_id } = req.body;
    db.get('SELECT * FROM vendors WHERE id=?',[vendor_id], async(err,vendor)=>{
      if(!vendor) return res.status(400).json({error:'Vendor not found'});
      try{
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: vendor.email,
          subject:'TPRM Questionnaire',
          text:`${process.env.CLIENT_URL}/vendor/${vendor.id}`
        });
        res.json({success:true});
      }catch(e){ console.error(e); res.status(500).json({error:'Email failed'}); }
    });
  }
);

// --- DASHBOARD ---
app.get('/dashboard', authenticateToken, authorizeRoles('admin'), (req,res)=>{
  db.all(`SELECT v.name,
                 COUNT(r.id) as total_responses,
                 COUNT(CASE WHEN r.remark IS NOT NULL THEN 1 END) as answered
          FROM vendors v LEFT JOIN responses r ON v.id=r.vendor_id
          GROUP BY v.id`, (err,rows)=> res.json(rows));
});

// --- EXPORT CSV ---
app.get('/export/responses', authenticateToken, authorizeRoles('admin'), (req,res)=>{
  db.all('SELECT * FROM responses',(err,rows)=>{
    const { Parser } = require('json2csv');
    const csv = new Parser().parse(rows);
    res.header('Content-Type','text/csv');
    res.attachment('responses.csv');
    res.send(csv);
  });
});

app.use('/uploads', express.static('uploads'));

// --- 404 ---
app.use((req,res)=>{ res.status(404).json({error:'Route not found'}); });

// --- ERROR ---
app.use((err,req,res,next)=>{ console.error(err.stack); res.status(500).json({error:'Something went wrong!'}); });

// --- Cron cleanup uploads ---
cron.schedule('0 0 * * *', ()=>{
  const cutoff = Date.now() - 30*24*60*60*1000;
  fs.readdirSync('uploads').forEach(file=>{
    if(fs.statSync(`uploads/${file}`).mtime<cutoff) fs.unlinkSync(`uploads/${file}`);
  });
});

process.on('SIGINT', ()=>{
  db.close(err=>{ if(err) console.error(err.message); console.log('DB closed.'); process.exit(0); });
});

app.get('/health',(req,res)=>res.json({status:'OK', timestamp:new Date().toISOString()}));

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
