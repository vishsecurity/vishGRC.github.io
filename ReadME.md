Perfect! Here's a **clean README + working `server.js` + `admin.html` setup** for your GRC TPRM dashboard. This integrates everything: SQLite DB, API endpoints, client/vendor/question management, and frontend display.

---

## **README.md**

````markdown
# GRC TPRM Admin Dashboard

## Overview
This project provides an **Admin Dashboard** for managing Clients, Vendors, and Questions in a GRC (Governance, Risk, Compliance) TPRM system using **Node.js**, **Express**, and **SQLite**.

## Features
- Add / Delete Clients
- Add / Delete Vendors
- Add Questions for clients
- Automatic refresh of dashboard to match database
- Handles orphaned vendors/questions if client is deleted

## Prerequisites
- Node.js v18+
- npm (Node Package Manager)
- Browser for frontend (`admin.html`)

## Libraries Used
- [express](https://www.npmjs.com/package/express) - Web server
- [sqlite3](https://www.npmjs.com/package/sqlite3) - Database
- [body-parser](https://www.npmjs.com/package/body-parser) - Parsing JSON & URL data
- [cors](https://www.npmjs.com/package/cors) - Enable cross-origin requests
- [axios](https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js) - Frontend HTTP requests

## Setup
1. Clone the project
2. Install dependencies:
   ```bash
   npm install express sqlite3 body-parser cors
````

3. Start the server:

   ```bash
   node server.js
   ```
4. Open `admin.html` in a browser.

## Folder Structure

```
project/
├── server.js          # Backend server
├── admin.html         # Frontend dashboard
├── database.sqlite    # SQLite database file
├── package.json
└── README.md
```

## Notes

* All data is stored in `database.sqlite`.
* Dashboard automatically fetches current data from database.
* Deleting a client will remove it from clients list but leave vendors/questions orphaned; they must be handled manually or extended with cleanup endpoints.

```

---

### ✅ Instructions

1. Save the `server.js` file as provided.
2. Save `admin.html` in the same folder.
3. Run `node server.js`.
4. Open `admin.html` in your browser.

The frontend will automatically interact with your SQLite DB via the API.

