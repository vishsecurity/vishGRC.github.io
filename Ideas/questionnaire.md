TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  control TEXT,
  it_governance TEXT,
  reference TEXT,
  implementation TEXT,
  evidence TEXT,
  remarks TEXT
);

TABLE vendor_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER,
  vendor_code TEXT,
  implementation TEXT,
  evidence TEXT,
  remarks TEXT
);


<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Questionnaire App</title>

<style>
body { font-family: Arial; margin: 20px; }
table { border-collapse: collapse; width: 100%; margin-top: 10px; }
th, td { border: 1px solid #ccc; padding: 6px; }
input, select, textarea { width: 100%; }
button { padding: 5px 10px; margin: 2px; }
.link-box { font-size: 12px; color: blue; cursor: pointer; }
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
</head>

<body>

<h2>Questionnaire Management</h2>

<input type="file" id="csvFile">
<button onclick="uploadCSV()">Upload CSV</button>
<button onclick="deleteAll()">Delete All</button>

<div id="questions"></div>

<script>
let db;
let SQL;

initDB();

async function initDB() {
  SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  db = new SQL.Database();
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      control TEXT,
      it_governance TEXT,
      reference TEXT,
      implementation TEXT,
      evidence TEXT,
      remarks TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendor_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER,
      vendor_code TEXT,
      implementation TEXT,
      evidence TEXT,
      remarks TEXT
    );
  `);

  render();
}

function uploadCSV() {
  const file = document.getElementById("csvFile").files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const rows = reader.result.split("\n").slice(1);
    rows.forEach(row => {
      const cols = row.split(",");
      if (cols.length >= 3) {
        db.run(
          `INSERT INTO questions 
           (control,it_governance,reference,implementation,evidence,remarks) 
           VALUES (?,?,?,?,?,?)`,
          [cols[0], cols[1], cols[2], "", "", ""]
        );
      }
    });
    render();
  };
  reader.readAsText(file);
}

function render() {
  const res = db.exec("SELECT * FROM questions");
  let html = `<table>
    <tr>
      <th>Control</th><th>IT Governance</th><th>Reference</th>
      <th>Implementation</th><th>Evidence</th><th>Remarks</th>
      <th>Actions</th>
    </tr>`;

  if (res.length) {
    res[0].values.forEach(q => {
      const vendorCode = "V-" + Math.random().toString(36).substr(2,8);

      html += `
      <tr>
        <td><input value="${q[1]}" id="c${q[0]}"></td>
        <td><input value="${q[2]}" id="g${q[0]}"></td>
        <td><input value="${q[3]}" id="r${q[0]}"></td>

        <td>
          <select id="i${q[0]}">
            <option>Yes</option>
            <option>No</option>
            <option>NA</option>
          </select>
        </td>

        <td><input type="file" id="e${q[0]}"></td>
        <td><textarea id="m${q[0]}">${q[6] || ""}</textarea></td>

        <td>
          <button onclick="save(${q[0]})">Submit</button>
          <button onclick="modify(${q[0]})">Modify</button>
          <div class="link-box"
               onclick="copyLink(${q[0]},'${vendorCode}')">
               Generate Link
          </div>
        </td>
      </tr>`;
    });
  }

  html += "</table>";
  document.getElementById("questions").innerHTML = html;
}

function save(id) {
  db.run(
    `UPDATE questions SET 
     control=?, it_governance=?, reference=?, 
     implementation=?, remarks=? WHERE id=?`,
    [
      document.getElementById("c"+id).value,
      document.getElementById("g"+id).value,
      document.getElementById("r"+id).value,
      document.getElementById("i"+id).value,
      document.getElementById("m"+id).value,
      id
    ]
  );
  alert("Saved");
}

function modify(id) {
  save(id);
}

function copyLink(qid, vendorCode) {
  const link = `${location.href}?question=${qid}&vendor=${vendorCode}`;
  navigator.clipboard.writeText(link);
  alert("Link copied:\n" + link);
}

function deleteAll() {
  db.run("DELETE FROM questions");
  render();
}
</script>

</body>
</html>
