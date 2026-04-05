// Main Express application
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { initializeDatabase, } = require("./database");

// Import routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const bookRoutes = require("./routes/books");
const memberRoutes = require("./routes/members");
const borrowingRoutes = require("./routes/borrowing");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/../public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// View engine setup (for HTML files)
app.set("views", path.join(__dirname, "/../views"));
app.set("view engine", "ejs");

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrowing", borrowingRoutes);

// Simple login page (HTML)
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/dashboard");
  }
  res.sendFile(path.join(__dirname, "/../views/login.html"));
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "/../views/dashboard.html"));
});

// Books page
app.get("/books", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "/../views/books.html"));
});

// Members page
app.get("/members", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "/../views/members.html"));
});

// Borrowing page
app.get("/borrowing", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "/../views/borrowing.html"));
});

// Reports page
app.get("/reports", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "/../views/reports.html"));
});

// Index page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/dashboard");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function start() {
  try {
    // Initialize database
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Only start if this file is run directly, not when imported
if (require.main === module) {
  start();
}

module.exports = app;
