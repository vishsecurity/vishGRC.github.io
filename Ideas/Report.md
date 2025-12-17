<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Export CSV</title>

<style>
body {
  font-family: Arial;
  margin: 20px;
}
button {
  padding: 8px 15px;
  margin: 5px 0;
}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
</head>

<body>

<h2>Export Controls & Vendors</h2>

<input type="file" id="dbFile">
<br><br>

<button onclick="exportControls()">Export Control Responses CSV</button>
<br>
<button onclick="exportVendors()">Export Vendor List CSV</button>

<script>
let db, SQL;

async function loadDB() {
  if (db) return;

  SQL = await initSqlJs({
    locateFile: file =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  const file = document.getElementById("dbFile").files[0];
  if (!file) {
    alert("Please select SQLite DB file");
    return;
  }

  const buffer = await file.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));
}

async function exportControls() {
  await loadDB();

  const res = db.exec(`
    SELECT
      control,
      it_governance,
      reference,
      implementation,
      evidence,
      remarks
    FROM questions
  `);

  if (!res.length) {
    alert("No control data found");
    return;
  }

  downloadCSV(
    ["Control","IT Governance","Reference","Implementation","Evidence","Remarks"],
    res[0].values,
    "control_responses.csv"
  );
}

async function exportVendors() {
  await loadDB();

  const res = db.exec(`
    SELECT
      vendor_function,
      service_description,
      service_type,
      supplier,
      legal_entity,
      clix_representative,
      status
    FROM vendors
  `);

  if (!res.length) {
    alert("No vendor data found");
    return;
  }

  downloadCSV(
    [
      "Vendor Function",
      "Describe Nature of Service",
      "Regular/One Time/Exception",
      "Supplier",
      "Legal Entity Type",
      "Clix Representative / Customer Data Shared",
      "Status"
    ],
    res[0].values,
    "vendors.csv"
  );
}

function downloadCSV(headers, rows, filename) {
  let csv = headers.join(",") + "\n";
  rows.forEach(r => {
    csv += r.map(v => `"${v || ""}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
</script>

</body>
</html>
