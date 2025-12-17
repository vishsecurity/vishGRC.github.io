questions
vendor_responses
vendors


<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pending Vendor Responses</title>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}
button {
  padding: 6px 12px;
  margin: 5px 0;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 15px;
}
th, td {
  border: 1px solid #ccc;
  padding: 6px;
  font-size: 13px;
}
.status-missing { color: red; font-weight: bold; }
.status-warning { color: orange; font-weight: bold; }
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
</head>

<body>

<h2>Incomplete Vendor Responses Tracker</h2>

<input type="file" id="dbFile">
<button onclick="loadDB()">Load Database</button>

<div id="result"></div>

<script>
let db, SQL;

async function loadDB() {
  const file = document.getElementById("dbFile").files[0];
  if (!file) return alert("Select SQLite DB file");

  SQL = await initSqlJs({
    locateFile: f =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}`
  });

  const buffer = await file.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  findPending();
}

function findPending() {
  const vendors = db.exec(`SELECT id, supplier FROM vendors`);
  const questions = db.exec(`SELECT id, control FROM questions`);

  if (!vendors.length || !questions.length) {
    alert("Vendors or Questions not found");
    return;
  }

  let html = `
  <table>
    <tr>
      <th>Vendor</th>
      <th>Control</th>
      <th>Status</th>
      <th>Issue</th>
    </tr>`;

  vendors[0].values.forEach(v => {
    questions[0].values.forEach(q => {

      const r = db.exec(`
        SELECT implementation, evidence, remarks
        FROM vendor_responses
        WHERE vendor_code = ?
        AND question_id = ?
      `, [v[0], q[0]]);

      if (!r.length) {
        html += row(v[1], q[1], "Not Responded", "No submission");
        return;
      }

      const [impl, ev, rem] = r[0].values[0];

      if (!impl) {
        html += row(v[1], q[1], "Incomplete", "Implementation missing");
      } else if (impl === "Yes" && !ev) {
        html += row(v[1], q[1], "Evidence Pending", "Evidence not uploaded");
      } else if (impl === "NA" && !rem) {
        html += row(v[1], q[1], "Justification Pending", "NA without remarks");
      }

    });
  });

  html += "</table>";
  document.getElementById("result").innerHTML = html;
}

function row(vendor, control, status, issue) {
  const cls = status === "Not Responded"
    ? "status-missing"
    : "status-warning";

  return `
  <tr>
    <td>${vendor}</td>
    <td>${control}</td>
    <td class="${cls}">${status}</td>
    <td>${issue}</td>
  </tr>`;
}
</script>

</body>
</html>
