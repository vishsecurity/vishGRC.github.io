CREATE TABLE vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_function TEXT,
  service_description TEXT,
  service_type TEXT,
  supplier TEXT,
  legal_entity TEXT,
  clix_representative TEXT,
  status TEXT
);

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Vendor Management</title>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}
h2 {
  margin-bottom: 10px;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ccc;
  padding: 6px;
}
input, select {
  width: 100%;
}
button {
  padding: 5px 10px;
  margin: 3px;
}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
</head>

<body>

<h2>Vendor Management</h2>

<input type="file" id="csvFile">
<button onclick="uploadCSV()">Upload Vendor CSV</button>
<button onclick="deleteAll()">Delete All Vendors</button>

<div id="vendorTable"></div>

<script>
let db;
let SQL;

initDB();

async function initDB() {
  SQL = await initSqlJs({
    locateFile: file =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_function TEXT,
      service_description TEXT,
      service_type TEXT,
      supplier TEXT,
      legal_entity TEXT,
      clix_representative TEXT,
      status TEXT
    );
  `);

  render();
}

function uploadCSV() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) return alert("Select CSV file");

  const reader = new FileReader();
  reader.onload = () => {
    const rows = reader.result.split("\n").slice(1);
    rows.forEach(r => {
      const c = r.split(",");
      if (c.length >= 7) {
        db.run(
          `INSERT INTO vendors
           (vendor_function, service_description, service_type,
            supplier, legal_entity, clix_representative, status)
           VALUES (?,?,?,?,?,?,?)`,
          c.map(x => x.trim())
        );
      }
    });
    render();
  };
  reader.readAsText(file);
}

function render() {
  const res = db.exec("SELECT * FROM vendors");
  let html = `
  <table>
    <tr>
      <th>S.No</th>
      <th>Vendor Function</th>
      <th>Describe Nature of Service</th>
      <th>Regular / One Time / Exception</th>
      <th>Supplier</th>
      <th>Legal Entity Type</th>
      <th>Clix Representative / Customer Data Shared</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>`;

  if (res.length) {
    res[0].values.forEach((v, i) => {
      html += `
      <tr>
        <td>${i + 1}</td>

        <td><input id="vf${v[0]}" value="${v[1] || ''}"></td>
        <td><input id="sd${v[0]}" value="${v[2] || ''}"></td>

        <td>
          <select id="st${v[0]}">
            <option ${v[3]=='Regular'?'selected':''}>Regular</option>
            <option ${v[3]=='One Time'?'selected':''}>One Time</option>
            <option ${v[3]=='Exception'?'selected':''}>Exception</option>
          </select>
        </td>

        <td><input id="sp${v[0]}" value="${v[4] || ''}"></td>
        <td><input id="le${v[0]}" value="${v[5] || ''}"></td>

        <td>
          <select id="cr${v[0]}">
            <option ${v[6]=='Yes'?'selected':''}>Yes</option>
            <option ${v[6]=='No'?'selected':''}>No</option>
          </select>
        </td>

        <td>
          <select id="ss${v[0]}">
            <option ${v[7]=='Active'?'selected':''}>Active</option>
            <option ${v[7]=='Inactive'?'selected':''}>Inactive</option>
          </select>
        </td>

        <td>
          <button onclick="save(${v[0]})">Save</button>
          <button onclick="del(${v[0]})">Delete</button>
        </td>
      </tr>`;
    });
  }

  html += "</table>";
  document.getElementById("vendorTable").innerHTML = html;
}

function save(id) {
  db.run(
    `UPDATE vendors SET
     vendor_function=?, service_description=?, service_type=?,
     supplier=?, legal_entity=?, clix_representative=?, status=?
     WHERE id=?`,
    [
      document.getElementById("vf"+id).value,
      document.getElementById("sd"+id).value,
      document.getElementById("st"+id).value,
      document.getElementById("sp"+id).value,
      document.getElementById("le"+id).value,
      document.getElementById("cr"+id).value,
      document.getElementById("ss"+id).value,
      id
    ]
  );
  alert("Vendor saved");
}

function del(id) {
  db.run("DELETE FROM vendors WHERE id=?", [id]);
  render();
}

function deleteAll() {
  if (confirm("Delete all vendors?")) {
    db.run("DELETE FROM vendors");
    render();
  }
}
</script>

</body>
</html>
