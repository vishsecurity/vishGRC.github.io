// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads and the SPA
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// --- SQLite setup ---
const DB_FILE = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Error opening DB:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite DB');
});

// Promisified DB helpers
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// --- Create Tables If Not Exist ---
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      control_name TEXT NOT NULL,
      question TEXT NOT NULL,
      reference TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      vendor_id INTEGER NOT NULL,
      evidence TEXT,
      evidence_name TEXT,
      remark TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS logos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      image BLOB,
      image_name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Auto‑create default admin if none exists
  (async () => {
    try {
      const row = await getAsync('SELECT COUNT(*) AS count FROM users', []);
      if (!row || row.count === 0) {
        const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
        const hashed = await bcrypt.hash(defaultPassword, 10);
        await runAsync(
          'INSERT INTO users(username, password, role) VALUES(?,?,?)',
          [defaultUsername, hashed, 'admin']
        );
        console.log('======================================');
        console.log('🚀 Default admin user created');
        console.log(`    username: ${defaultUsername}`);
        console.log(`    password: ${defaultPassword}`);
        console.log('======================================');
      }
    } catch (err) {
      console.error('Admin creation error:', err);
    }
  })();
});

// --- File Upload Setup ---
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// --- API Endpoints ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

// --- Auth ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await getAsync('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Users CRUD ---
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'username/password/role required' });

    const hashed = await bcrypt.hash(password, 10);
    const id = await runAsync('INSERT INTO users(username,password,role) VALUES(?,?,?)', [username, hashed, role]);
    res.status(201).json({ success: true, id, username, role });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) res.status(409).json({ error: 'Username already exists' });
    else res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await allAsync('SELECT id, username, role, created_at FROM users', []);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    let query = 'UPDATE users SET username = ?, role = ?';
    const params = [username, role];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashed);
    }
    query += ' WHERE id = ?';
    params.push(id);

    await runAsync(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    await runAsync('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Vendors CRUD ---
app.post('/api/vendors', async (req, res) => {
  try {
    const { name, email, type } = req.body;
    if (!name || !email || !type) return res.status(400).json({ error: 'name, email, type required' });

    const id = await runAsync('INSERT INTO vendors(name,email,type) VALUES(?,?,?)', [name, email, type]);
    res.status(201).json({ success: true, id });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) res.status(409).json({ error: 'Vendor email exists' });
    else res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await allAsync('SELECT * FROM vendors', []);
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const { name, email, type } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid vendor id' });

    await runAsync('UPDATE vendors SET name = ?, email = ?, type = ? WHERE id = ?', [name, email, type, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid vendor id' });

    await runAsync('DELETE FROM vendors WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Audit Questions CRUD ---
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await allAsync('SELECT id, control_name, question, reference FROM audit_questions ORDER BY control_name, id', []);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { control_name, question, reference } = req.body;
    if (!control_name || !question) return res.status(400).json({ error: 'control_name and question required' });

    const id = await runAsync('INSERT INTO audit_questions(control_name,question,reference) VALUES(?,?,?)', [control_name, question, reference || null]);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const { control_name, question, reference } = req.body;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid question id' });

    await runAsync('UPDATE audit_questions SET control_name = ?, question = ?, reference = ? WHERE id = ?', [control_name, question, reference || null, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid question id' });

    await runAsync('DELETE FROM audit_questions WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Responses ---
app.post('/api/responses', upload.single('evidence'), async (req, res) => {
  try {
    const { question_id, vendor_id, remark } = req.body;
    if (!question_id || !vendor_id) return res.status(400).json({ error: 'question_id and vendor_id required' });

    let evidencePath = null;
    let evidenceName = null;
    if (req.file) {
      evidencePath = req.file.path;
      evidenceName = req.file.originalname;
    }

    const id = await runAsync(
      'INSERT INTO responses(question_id,vendor_id,evidence,evidence_name,remark) VALUES(?,?,?,?,?)',
      [question_id, vendor_id, evidencePath, evidenceName, remark || null]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/responses', async (req, res) => {
  try {
    const rows = await allAsync(`
      SELECT r.id, r.remark, r.evidence, r.evidence_name,
             q.control_name, q.question,
             v.name AS vendor_name
      FROM responses r
      JOIN audit_questions q ON r.question_id = q.id
      JOIN vendors v ON r.vendor_id = v.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Progress ---
app.get('/api/progress', async (req, res) => {
  try {
    const rows = await allAsync(`
      SELECT v.id AS vendor_id, v.name, v.type,
             COUNT(r.id) AS answered,
             (SELECT COUNT(*) FROM audit_questions) AS total_questions,
             CASE WHEN (SELECT COUNT(*) FROM audit_questions)=0 THEN 0
                  ELSE ROUND(COUNT(r.id)*100.0/(SELECT COUNT(*) FROM audit_questions),2) END AS completion_percent
      FROM vendors v
      LEFT JOIN responses r ON v.id=r.vendor_id
      GROUP BY v.id, v.name, v.type
    `, []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- SPA fallback ---
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 for API
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
