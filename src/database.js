const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || "./database/library.db";

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    db.exec(schema, (err) => {
      if (err) {
        console.error("Error initializing database:", err.message);
        reject(err);
      } else {
        console.log("Database initialized successfully");
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
};
