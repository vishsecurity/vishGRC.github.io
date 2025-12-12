const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

(async () => {
  const username = 'admin';
  const password = 'Admin@123';
  const role = 'admin';

  const hashed = await bcrypt.hash(password, 10);

  db.run('INSERT INTO users(username, password, role) VALUES(?,?,?)', [username, hashed, role], function(err) {
    if (err) console.error(err);
    else console.log(`Admin created with username: ${username} and password: ${password}`);
    db.close();
  });
})();
