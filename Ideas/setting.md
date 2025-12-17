<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>User Management</title>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}
input, select {
  padding: 5px;
  margin: 5px 0;
  width: 250px;
}
button {
  padding: 6px 12px;
  margin: 5px 0;
}
table {
  border-collapse: collapse;
  margin-top: 15px;
  width: 100%;
}
th, td {
  border: 1px solid #ccc;
  padding: 6px;
}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
</head>

<body>

<h2>User Management</h2>

<h4>1. Load SQLite Database</h4>
<input type="file" id="dbFile">
<button onclick="loadDB()">Load Database</button>

<hr>

<h4>2. Create User</h4>
<input id="username" placeholder="Username"><br>
<input id="role" placeholder="Role (Admin/Vendor/User)"><br>
<button onclick="addUser()">Create User</button>

<hr>

<h4>3. User List</h4>
<div id="userTable"></div>

<script>
let db, SQL;

/* Load database file */
async function loadDB() {
  const file = document.getElementById("dbFile").files[0];
  if (!file) return alert("Select SQLite database file");

  SQL = await initSqlJs({
    locateFile: file =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  const buffer = await file.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  initUserTable();
  renderUsers();
}

/* Create users table if not exists */
function initUserTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      role TEXT,
      created_at TEXT
    );
  `);
}

/* Add user */
function addUser() {
  if (!db) return alert("Load database first");

  const u = document.getElementById("username").value.trim();
  const r = document.getElementById("role").value.trim();

  if (!u || !r) return alert("Enter username and role");

  try {
    db.run(
      `INSERT INTO users (username, role, created_at)
       VALUES (?,?,datetime('now'))`,
      [u, r]
    );
    renderUsers();
  } catch {
    alert("User already exists");
  }
}

/* Render users */
function renderUsers() {
  const res = db.exec("SELECT * FROM users");
  let html = `
  <table>
    <tr>
      <th>ID</th>
      <th>Username</th>
      <th>Role</th>
      <th>Created At</th>
      <th>Action</th>
    </tr>`;

  if (res.length) {
    res[0].values.forEach(u => {
      html += `
      <tr>
        <td>${u[0]}</td>
        <td>${u[1]}</td>
        <td>${u[2]}</td>
        <td>${u[3]}</td>
        <td>
          <button onclick="deleteUser(${u[0]})">Delete</button>
        </td>
      </tr>`;
    });
  }

  html += "</table>";
  document.getElementById("userTable").innerHTML = html;
}

/* Delete user */
function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  db.run("DELETE FROM users WHERE id=?", [id]);
  renderUsers();
}
</script>

</body>
</html>
