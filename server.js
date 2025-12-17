require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// ✅ PRODUCTION EMAIL with fallback
let transporter;
try {
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  console.log('✅ Email: Gmail configured');
} catch (e) {
  console.log('⚠️ Email: Disabled (install nodemailer)');
  transporter = null;
}

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'acquisory-tprm-jwt-2025-production';
const JWT_EXPIRY = '7d';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '25') * 1024 * 1024;

// Ensure directories
const uploadsDir = './uploads';
const publicDir = './public';
['uploads', 'public'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🔒 Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:4000',
    'https://*.ngrok-free.app'
  ],
  credentials: true
}));

// 📊 Rate Limiting
const loginLimiter = rateLimit({ 
  windowMs: 15*60*1000, 
  max: 5, 
  message: { error: 'Too many login attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({ 
  windowMs: 15*60*1000, 
  max: 100, 
  message: { error: 'Too many requests' }
});

const vendorLimiter = rateLimit({ 
  windowMs: 60*60*1000, 
  max: 50, 
  message: { error: 'Too many vendor submissions' }
});

// 🛠️ Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// 📁 File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `evidence-${req.params?.vendorId || 'unknown'}-${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|docx?|xlsx?|pptx?|jpg|jpeg|png|txt/i;
  if (allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: PDF, DOCX, XLSX, PPTX, JPG, PNG, TXT only'), false);
  }
};

const upload = multer({ 
  storage, 
  limits: { fileSize: MAX_FILE_SIZE, files: 10 }, 
  fileFilter 
});

// 🔐 JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// 🗄️ Database Setup
const dbFile = process.env.DB_PATH || './tprm-production.db';
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ SQLite connected:', dbFile);
});

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Enhanced Vendors table with ALL fields
  db.run(`CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    function TEXT DEFAULT '',
    service_description TEXT DEFAULT '',
    service_type TEXT DEFAULT '',
    supplier TEXT DEFAULT '',
    legal_entity TEXT DEFAULT '',
    clix_rep TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    risk_score REAL DEFAULT 0,
    risk_level TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    last_assessment DATETIME,
    created_by INTEGER,
    notes TEXT
  )`);

  // Questions table
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_id TEXT UNIQUE,
    question TEXT NOT NULL,
    category TEXT,
    reference TEXT,
    domain TEXT,
    type TEXT DEFAULT 'text',
    weight REAL DEFAULT 1.0,
    required INTEGER DEFAULT 1
  )`);

  // Responses table
  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT,
    remarks TEXT,
    files TEXT,
    score REAL DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, question_id)
  )`);

  // Performance indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_responses_vendor ON responses(vendor_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain)');

  // Add missing vendor columns if they don't exist
  const vendorFields = ['function', 'service_description', 'service_type', 'supplier', 'legal_entity', 'clix_rep'];
  vendorFields.forEach(field => {
    db.run(`ALTER TABLE vendors ADD COLUMN ${field} TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error(`ALTER TABLE error for ${field}:`, err);
    });
  });

  // Default admin user
  const adminHash = bcrypt.hashSync('admin123', 12);
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, 
    ['admin', adminHash, 'admin']);

  // Production TPRM questions
  const productionQuestions = [
    ['SEC-1.1', 'Multi-factor authentication (MFA) enforced for all users?', 'cybersecurity', 'NIST 800-63B', 'all', 'radio', 1.5, 1],
    ['SEC-1.2', 'Password policy: minimum 12 characters, complexity enforced?', 'cybersecurity', 'NIST 800-53', 'all', 'radio', 1.2, 1],
    ['SEC-2.1', 'Data encryption at rest using AES-256 or equivalent?', 'cybersecurity', 'NIST 800-53', 'all', 'radio', 2.0, 1],
    ['SEC-2.2', 'Data in transit encrypted with TLS 1.2+?', 'cybersecurity', 'NIST 800-52', 'all', 'radio', 1.8, 1],
    ['CMP-1.1', 'SOC 2 Type II, ISO 27001, or equivalent certification?', 'compliance', 'SOC2/ISO27001', 'all', 'radio', 2.5, 0],
    ['FIN-1.1', 'PCI DSS compliance for payment processing?', 'financial', 'PCI DSS', 'finance', 'radio', 2.8, 1]
  ];

  db.get('SELECT COUNT(*) as count FROM questions', (err, row) => {
    if (row?.count === 0) {
      productionQuestions.forEach(([control_id, question, category, reference, domain, type, weight, required]) => {
        db.run(`INSERT INTO questions (control_id, question, category, reference, domain, type, weight, required) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [control_id, question, category, reference, domain, type, weight, required]);
      });
      console.log('✅ Production TPRM framework loaded (6 questions)');
    }
  });
});

// ==========================
// 🔐 AUTHENTICATION & USER MANAGEMENT
// ==========================

app.post('/api/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRY }
    );
    
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role }, 
      expiresIn: JWT_EXPIRY 
    });
  });
});

// GET /api/users - List users
app.get('/api/users', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  db.all('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(users || []);
  });
});

// POST /api/users - Create user
app.post('/api/users', [authenticateToken, requireAdmin, vendorLimiter], (req, res) => {
  const { username, password, role = 'user' } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const hash = bcrypt.hashSync(password, 12);
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username.trim().toLowerCase(), hash, role],
    function(err) {
      if (err) return res.status(409).json({ error: 'Username exists' });
      res.json({ success: true, id: this.lastID, username });
    });
});

// DELETE /api/users/:id
app.delete('/api/users/:id', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// ==========================
// 📊 DASHBOARD STATS
// ==========================

app.get('/api/dashboard', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_vendors,
      COUNT(CASE WHEN status IN ('active', 'completed') THEN 1 END) as completed,
      COUNT(CASE WHEN risk_level IN ('high', 'critical') THEN 1 END) as high_risk,
      ROUND(AVG(COALESCE(risk_score, 0)), 1) as avg_risk_score,
      COUNT(DISTINCT r.vendor_id) as vendors_with_responses
    FROM vendors v
    LEFT JOIN responses r ON v.id = r.vendor_id
  `, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Dashboard stats failed' });
    }
    res.json({ 
      stats: stats || { 
        total_vendors: 0, 
        completed: 0, 
        high_risk: 0, 
        avg_risk_score: 0,
        vendors_with_responses: 0 
      }, 
      health: 'OK' 
    });
  });
});

// ==========================
// 🏢 FULL VENDOR CRUD (ENHANCED)
// ==========================

// GET /api/vendors - List with search, filter, pagination
app.get('/api/vendors', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  const { search, status, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT 
      v.*, 
      COUNT(r.id) as response_count,
      ROUND(AVG(r.score), 1) as avg_score,
      MAX(r.submitted_at) as last_response,
      COUNT(CASE WHEN r.answer IS NOT NULL THEN 1 END) as completed_questions
    FROM vendors v 
    LEFT JOIN responses r ON v.id = r.vendor_id
  `;
  
  let params = [];
  let whereClause = 'WHERE 1=1';
  
  if (status && status !== 'all') {
    whereClause += ' AND v.status = ?';
    params.push(status);
  }
  
  if (search) {
    whereClause += ' AND (LOWER(v.name) LIKE LOWER(?) OR LOWER(v.email) LIKE LOWER(?) OR LOWER(v.domain) LIKE LOWER(?))';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ` ${whereClause}
             GROUP BY v.id 
             ORDER BY v.created_at DESC 
             LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, vendors) => {
    if (err) {
      console.error('Vendors query error:', err);
      return res.status(500).json({ error: 'Failed to fetch vendors' });
    }
    
    const vendorsWithMetrics = vendors.map(v => ({
      ...v,
      risk_score: v.avg_score || 0,
      risk_level: !v.avg_score ? 'unassessed' : 
                  v.avg_score > 8 ? 'low' : 
                  v.avg_score > 5 ? 'medium' : 'high',
      completion_pct: v.response_count ? Math.round((v.completed_questions / 6) * 100) : 0
    }));
    
    db.get(`SELECT COUNT(DISTINCT v.id) as total FROM vendors v ${whereClause}`, params.slice(0, -2), (err, count) => {
      res.json({
        vendors: vendorsWithMetrics,
        pagination: { total: count?.total || 0, limit: parseInt(limit), offset: parseInt(offset) }
      });
    });
  });
});

// POST /api/vendors - Create single or multiple vendors
app.post('/api/vendors', [authenticateToken, requireAdmin, vendorLimiter], (req, res) => {
  const vendors = req.body.vendors;
  
  if (!vendors || (!Array.isArray(vendors) && !vendors.name)) {
    return res.status(400).json({ error: 'vendors array or single vendor object required' });
  }
  
  const vendorList = Array.isArray(vendors) ? vendors : [vendors];
  const created = [];
  const errors = [];
  
  const stmt = db.prepare(`
    INSERT INTO vendors (id, name, email, domain, function, service_description, service_type, supplier, legal_entity, clix_rep, status, created_by) 
    VALUES (?, ?, LOWER(?), ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `);
  
  db.serialize(() => {
    vendorList.forEach((v) => {
      if (!v.name || !v.email || !v.domain) {
        errors.push({ error: 'name, email, domain required', vendor: v });
        return;
      }
      
      const vendorId = `vid-${Date.now()}-${uuidv4().slice(0,8)}`;
      
      stmt.run([
        vendorId, 
        v.name.trim(), 
        v.email.trim(), 
        v.domain.trim(),
        v.function || '',
        v.service_description || '',
        v.service_type || '',
        v.supplier || '',
        v.legal_entity || '',
        v.clix_rep || '',
        req.user.id
      ], function(err) {
        if (err) {
          errors.push({ error: err.message, vendor: v });
        } else {
          created.push({ id: vendorId, name: v.name, email: v.email, domain: v.domain });
        }
      });
    });
    
    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      const result = { success: created.length > 0, created: created.length, total: vendorList.length };
      if (created.length) result.createdVendors = created;
      if (errors.length) result.errors = errors;
      
      res.json(result);
    });
  });
});

// PUT /api/vendors/:id - Update ALL vendor fields
app.put('/api/vendors/:id', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  
  const allowedFields = [
    'name', 'email', 'domain', 'status', 'risk_score', 'risk_level', 'notes',
    'function', 'service_description', 'service_type', 'supplier', 
    'legal_entity', 'clix_rep'
  ];
  
  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(fields)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  db.run(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: 'Update failed' });
    if (this.changes === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ success: true, changes: this.changes });
  });
});

// DELETE /api/vendors/:id
app.delete('/api/vendors/:id', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    db.run('DELETE FROM responses WHERE vendor_id = ?', [id]);
    db.run('DELETE FROM vendors WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete vendor' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vendor not found' });
      res.json({ success: true, changes: this.changes });
    });
  });
});

// ==========================
// 📝 VENDOR ASSESSMENT
// ==========================

app.post('/api/generate-link', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  const { name, email, domain } = req.body;
  
  if (!name || !email || !domain) {
    return res.status(400).json({ error: 'Name, email, domain required' });
  }

  const vendorId = `vid-${Date.now()}-${uuidv4().slice(0,8)}`;
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const assessmentUrl = `${baseUrl}/assessment?vendor=${vendorId}&domain=${domain}`;

  db.run(`
    INSERT INTO vendors (id, name, email, domain, created_by) 
    VALUES (?, ?, LOWER(?), ?, ?)
  `, [vendorId, name.trim(), email.trim(), domain.trim(), req.user.id], function(err) {
    if (err) {
      return res.status(409).json({ error: 'Vendor email already exists' });
    }

    if (transporter) {
      transporter.sendMail({
        to: email,
        subject: '🔒 Third-Party Risk Assessment - Action Required',
        html: `
          <h2>Third-Party Risk Management Assessment</h2>
          <p>Vendor: <strong>${name}</strong></p>
          <p>Domain: <strong>${domain}</strong></p>
          <p><a href="${assessmentUrl}" style="background:#007cba;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;">Complete Assessment</a></p>
          <p>This link expires in 7 days.</p>
        `
      }).catch(console.error);
    }
    
    res.json({ 
      success: true, 
      vendorId, 
      assessmentUrl,
      message: transporter ? 'Email sent successfully' : 'Link generated (email disabled)'
    });
  });
});

// GET /api/vendor/:vendorId
app.get('/api/vendor/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  const { domain } = req.query;
  
  if (!vendorId || !domain) {
    return res.status(400).json({ error: 'Vendor ID and domain required' });
  }

  db.get('SELECT * FROM vendors WHERE id = ?', [vendorId], (err, vendor) => {
    if (!vendor || vendor.domain !== domain) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    db.all(`
      SELECT 
        q.*, 
        r.answer, 
        r.remarks, 
        r.files, 
        r.score,
        CASE WHEN r.answer IS NOT NULL THEN 1 ELSE 0 END as responded
      FROM questions q 
      LEFT JOIN responses r ON q.id = r.question_id AND r.vendor_id = ?
      WHERE (q.domain = ? OR q.domain = 'all')
      ORDER BY q.category, q.control_id
    `, [vendorId, domain], (err, questions) => {
      if (err) return res.status(500).json({ error: 'Failed to load assessment' });
      
      const totalQuestions = questions.length;
      const completed = questions.filter(q => q.responded).length;
      
      res.json({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          domain: vendor.domain,
          status: vendor.status
        },
        questions,
        progress: { totalQuestions, completed, percentage: Math.round((completed / totalQuestions) * 100) }
      });
    });
  });
});

// POST /api/vendor/:vendorId/respond
app.post('/api/vendor/:vendorId/respond', [vendorLimiter, upload.array('files', 10)], (req, res) => {
  const { vendorId } = req.params;
  const { question_id, answer, remarks } = req.body;
  const files = req.files?.map(f => f.path).join(',') || null;
  
  if (!question_id || !answer) {
    if (files) {
      req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    }
    return res.status(400).json({ error: 'question_id and answer required' });
  }

  const scoreMap = { 'Yes': 10, 'Partial': 6, 'No': 2, 'N/A': 5 };
  const score = (scoreMap[answer] || 0);

  db.run(`
    INSERT OR REPLACE INTO responses (vendor_id, question_id, answer, remarks, files, score) 
    VALUES (?, ?, ?, ?, ?, ?)
  `, [vendorId, question_id, answer, remarks || '', files, score], function(err) {
    if (err) {
      if (files) {
        files.split(',').forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
      }
      return res.status(500).json({ error: 'Failed to save response' });
    }
    
    db.run(`UPDATE vendors SET status = 'active', submitted_at = CURRENT_TIMESTAMP WHERE id = ?`, [vendorId]);
    
    res.json({ 
      success: true, 
      responseId: this.lastID, 
      score, 
      message: 'Response saved successfully' 
    });
  });
});

// ==========================
// ❌ PENDING RESPONSES TRACKING
// ==========================

app.get('/api/pending-responses', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  const { vendorId } = req.query;
  let query = `
    SELECT 
      v.name as vendor, 
      v.email,
      v.domain,
      q.control_id, 
      q.question,
      r.answer,
      CASE 
        WHEN r.answer IS NULL THEN 'Not Responded'
        WHEN r.answer IS NOT NULL AND (r.files IS NULL OR r.files = '') THEN 'Evidence Pending'
        WHEN r.answer = 'No' AND (r.remarks IS NULL OR r.remarks = '') THEN 'Justification Pending'
        ELSE 'Complete'
      END as status,
      r.files,
      r.remarks,
      q.category
    FROM vendors v 
    JOIN questions q ON q.domain = 'all' OR q.domain = v.domain
    LEFT JOIN responses r ON r.vendor_id = v.id AND r.question_id = q.id
  `;
  let params = [];
  
  if (vendorId) {
    query += ' WHERE v.id = ?';
    params.push(vendorId);
  }
  
  query += ' ORDER BY v.name, q.category, q.control_id';
  
  db.all(query, params, (err, pending) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(pending || []);
  });
});

// ==========================
// 📤 CSV EXPORT
// ==========================

app.get('/api/export/vendors', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  db.all(`
    SELECT id, name, email, domain, function, service_description, 
           service_type, supplier, legal_entity, clix_rep, 
           status, risk_score, risk_level, created_at
    FROM vendors ORDER BY created_at DESC
  `, (err, vendors) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vendors.csv"');
    
    const csv = ['id,name,email,domain,function,service_description,service_type,supplier,legal_entity,clix_rep,status,risk_score,risk_level,created_at']
      .concat(vendors.map(v => 
        `"${v.id}","${v.name}","${v.email}","${v.domain}","${v.function || ''}","${v.service_description || ''}","${v.service_type || ''}","${v.supplier || ''}","${v.legal_entity || ''}","${v.clix_rep || ''}","${v.status}","${v.risk_score}","${v.risk_level}","${v.created_at}"`
      )).join('\n');
    
    res.send(csv);
  });
});

app.get('/api/export/responses', [authenticateToken, requireAdmin, apiLimiter], (req, res) => {
  db.all(`
    SELECT v.name as vendor, v.domain, q.control_id, q.question, q.category,
           r.answer, r.remarks, r.files, r.score, r.submitted_at
    FROM responses r
    JOIN vendors v ON v.id = r.vendor_id
    JOIN questions q ON q.id = r.question_id
    ORDER BY v.name, q.category, q.control_id
  `, (err, responses) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="control_responses.csv"');
    
    const csv = ['vendor,domain,control_id,question,category,answer,remarks,files,score,submitted_at']
      .concat(responses.map(r => 
        `"${r.vendor}","${r.domain}","${r.control_id}","${r.question.replace(/"/g,'""')}","${r.category}","${r.answer || ''}","${r.remarks?.replace(/"/g,'""') || ''}","${r.files || ''}","${r.score}","${r.submitted_at}"`
      )).join('\n');
    
    res.send(csv);
  });
});

// ==========================
// ⚙️ SETTINGS
// ==========================

app.get('/api/settings', [authenticateToken, requireAdmin], (req, res) => {
  db.all('SELECT * FROM questions ORDER BY category, control_id', (err, questions) => {
    if (err) return res.status(500).json({ error: 'Settings load failed' });
    res.json({
      questions: questions || [],
      emailEnabled: !!transporter,
      database: dbFile,
      maxFileSize: MAX_FILE_SIZE / 1024 / 1024 + 'MB'
    });
  });
});

// ==========================
// 🩺 HEALTH CHECK
// ==========================

app.get('/api/health', (req, res) => {
  db.get('SELECT COUNT(*) as vendor_count FROM vendors', (err, row) => {
    res.json({
      status: 'production-ready',
      timestamp: new Date().toISOString(),
      database: dbFile,
      emailEnabled: !!transporter,
      vendorCount: row?.vendor_count || 0,
      uptime: process.uptime().toFixed(1) + 's'
    });
  });
});

// ==========================
// 🌐 SPA ROUTING
// ==========================

app.get(['/', '/dashboard', '/vendors', '/assessments', '/risks', '/reports', '/settings', '/users', '/pending'], (req, res) => {
  res.sendFile(path.join(__dirname, publicDir, 'index.html'));
});

// ==========================
// 💥 ERROR HANDLING
// ==========================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` });
    }
    return res.status(400).json({ error: 'File upload failed' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==========================
// 🚀 START SERVER
// ==========================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Acquisory TPRM PRODUCTION v3.0 - 100% COMPLETE');
  console.log('='.repeat(90));
  console.log(`📍 Server:      http://localhost:${PORT}`);
  console.log(`👤 Login:      admin / admin123`);
  console.log(`📊 Dashboard:  http://localhost:${PORT}/dashboard`);
  console.log(`🏢 Vendors:    http://localhost:${PORT}/vendors`);
  console.log(`👥 Users:      http://localhost:${PORT}/users`);
  console.log(`❌ Pending:    http://localhost:${PORT}/pending`);
  console.log(`⚙️  Settings:  http://localhost:${PORT}/settings`);
  console.log(`🩺 Health:     http://localhost:${PORT}/api/health`);
  console.log(`💾 Database:   ${dbFile}`);
  console.log(`📁 Uploads:    ./${uploadsDir}/`);
  console.log('='.repeat(90));
});

// 🛑 Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown initiated...');
  server.close(() => {
    db.close((err) => {
      if (err) console.error('Database close error:', err);
      console.log('✅ Database closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    db.close(() => process.exit(0));
  });
});
