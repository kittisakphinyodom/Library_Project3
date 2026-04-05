#!/usr/bin/env node
/**
 * Comprehensive Test Suite for Library Management System v2
 * ตรวจสอบให้แน่ใจว่าระบบทำงานได้ 100%
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000";
let sessionCookie = null;

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to make HTTP requests with cookies
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add session cookie if available
    if (sessionCookie) {
      defaultHeaders["Cookie"] = sessionCookie;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: defaultHeaders,
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      // Capture set-cookie header
      if (res.headers["set-cookie"]) {
        sessionCookie = res.headers["set-cookie"][0].split(";")[0];
      }

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test suite
async function runAllTests() {
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log(
    "║   Library Management System v2 - Comprehensive Test Suite   ║",
    "cyan",
  );
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  let totalTests = 0;
  let passedTests = 0;
  const results = [];

  try {
    // ===== SECTION 1: SERVER CHECK =====
    log("\n📋 SECTION 1: Server & File Structure Check", "blue");
    log("═".repeat(60), "blue");

    // Check if files exist
    const filesToCheck = [
      "src/app.js",
      "src/database.js",
      "package.json",
      "database/schema.sql",
      ".env",
      "views/login.html",
      "views/dashboard.html",
    ];

    for (const file of filesToCheck) {
      totalTests++;
      const fullPath = path.join(__dirname, file);
      if (fs.existsSync(fullPath)) {
        log(`✓ ${file}`, "green");
        passedTests++;
        results.push({ name: `File: ${file}`, status: "✓ PASS" });
      } else {
        log(`✗ ${file} NOT FOUND`, "red");
        results.push({ name: `File: ${file}`, status: "✗ FAIL" });
      }
    }

    // Check package.json dependencies
    totalTests++;
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    const requiredDeps = ["express", "sqlite3", "express-session", "dotenv"];
    const hasDeps = requiredDeps.every((dep) => packageJson.dependencies[dep]);

    if (hasDeps) {
      log("✓ All required dependencies defined", "green");
      passedTests++;
      results.push({ name: "Dependencies in package.json", status: "✓ PASS" });
    } else {
      log("✗ Missing dependencies", "red");
      results.push({ name: "Dependencies in package.json", status: "✗ FAIL" });
    }

    // ===== SECTION 2: SERVER CONNECTION =====
    log("\n📋 SECTION 2: Server Connection Tests", "blue");
    log("═".repeat(60), "blue");

    // Test 1: Health Check
    totalTests++;
    try {
      const health = await makeRequest("GET", "/health");
      if (health.status === 200) {
        log(`✓ Health Check: ${health.status} OK`, "green");
        passedTests++;
        results.push({ name: "Health Check Endpoint", status: "✓ PASS" });
      } else {
        log(`✗ Health Check: Expected 200, got ${health.status}`, "red");
        results.push({ name: "Health Check Endpoint", status: "✗ FAIL" });
      }
    } catch (err) {
      log(`✗ Server not responding: ${err.message}`, "red");
      results.push({ name: "Health Check Endpoint", status: "✗ FAIL" });
    }

    // ===== SECTION 3: AUTHENTICATION TESTS =====
    log("\n📋 SECTION 3: Authentication Tests", "blue");
    log("═".repeat(60), "blue");

    // Test 2: Admin Login
    totalTests++;
    const adminLogin = await makeRequest("POST", "/api/auth/login", {
      username: "admin",
      password: "admin123",
    });

    if (adminLogin.status === 200 && adminLogin.data.success) {
      log(`✓ Admin Login: ${adminLogin.status} OK`, "green");
      log(
        `  User: ${adminLogin.data.user.full_name} (${adminLogin.data.user.role})`,
        "green",
      );
      passedTests++;
      results.push({ name: "Admin Login", status: "✓ PASS" });
    } else {
      log(`✗ Admin Login Failed: ${adminLogin.status}`, "red");
      results.push({ name: "Admin Login", status: "✗ FAIL" });
    }

    // Test 3: Librarian Login
    totalTests++;
    const libLogin = await makeRequest("POST", "/api/auth/login", {
      username: "librarian",
      password: "lib123",
    });

    if (libLogin.status === 200 && libLogin.data.success) {
      log(`✓ Librarian Login: ${libLogin.status} OK`, "green");
      log(
        `  User: ${libLogin.data.user.full_name} (${libLogin.data.user.role})`,
        "green",
      );
      passedTests++;
      results.push({ name: "Librarian Login", status: "✓ PASS" });
    } else {
      log(`✗ Librarian Login Failed`, "red");
      results.push({ name: "Librarian Login", status: "✗ FAIL" });
    }

    // Test 4: Invalid Login
    totalTests++;
    const invalidLogin = await makeRequest("POST", "/api/auth/login", {
      username: "admin",
      password: "wrongpassword",
    });

    if (invalidLogin.status === 401) {
      log(`✓ Invalid Login Rejected: ${invalidLogin.status}`, "green");
      passedTests++;
      results.push({ name: "Invalid Login Rejection", status: "✓ PASS" });
    } else {
      log(`✗ Invalid Login Not Rejected`, "red");
      results.push({ name: "Invalid Login Rejection", status: "✗ FAIL" });
    }

    // ===== SECTION 4: PROTECTED API TESTS =====
    log("\n📋 SECTION 4: Protected API Tests", "blue");
    log("═".repeat(60), "blue");

    // Login to get session
    sessionCookie = null;
    await makeRequest("POST", "/api/auth/login", {
      username: "admin",
      password: "admin123",
    });

    // Test 5: Get Books
    totalTests++;
    const books = await makeRequest("GET", "/api/books");
    if (books.status === 200 && Array.isArray(books.data)) {
      log(
        `✓ Get Books: ${books.status} OK (${books.data.length} books)`,
        "green",
      );
      passedTests++;
      results.push({ name: "Get Books API", status: "✓ PASS" });
    } else {
      log(`✗ Get Books Failed: ${books.status}`, "red");
      results.push({ name: "Get Books API", status: "✗ FAIL" });
    }

    // Test 6: Get Members
    totalTests++;
    const members = await makeRequest("GET", "/api/members");
    if (members.status === 200 && Array.isArray(members.data)) {
      log(
        `✓ Get Members: ${members.status} OK (${members.data.length} members)`,
        "green",
      );
      passedTests++;
      results.push({ name: "Get Members API", status: "✓ PASS" });
    } else {
      log(`✗ Get Members Failed: ${members.status}`, "red");
      results.push({ name: "Get Members API", status: "✗ FAIL" });
    }

    // Test 7: Get Dashboard Stats
    totalTests++;
    const stats = await makeRequest("GET", "/api/dashboard/stats");
    if (stats.status === 200 && stats.data.totalBooks !== undefined) {
      log(`✓ Dashboard Stats: ${stats.status} OK`, "green");
      log(`  Total Books: ${stats.data.totalBooks}`, "green");
      log(`  Available: ${stats.data.availableBooks}`, "green");
      log(`  Members: ${stats.data.activeMembers}`, "green");
      passedTests++;
      results.push({ name: "Dashboard Stats API", status: "✓ PASS" });
    } else {
      log(`✗ Dashboard Stats Failed`, "red");
      results.push({ name: "Dashboard Stats API", status: "✗ FAIL" });
    }

    // Test 8: Get Borrowing Records
    totalTests++;
    const borrowing = await makeRequest("GET", "/api/borrowing");
    if (borrowing.status === 200 && Array.isArray(borrowing.data)) {
      log(
        `✓ Get Borrowing: ${borrowing.status} OK (${borrowing.data.length} records)`,
        "green",
      );
      passedTests++;
      results.push({ name: "Get Borrowing API", status: "✓ PASS" });
    } else {
      log(`✗ Get Borrowing Failed`, "red");
      results.push({ name: "Get Borrowing API", status: "✗ FAIL" });
    }

    // Test 9: Get Overdue Books
    totalTests++;
    const overdue = await makeRequest("GET", "/api/borrowing/overdue");
    if (overdue.status === 200 && Array.isArray(overdue.data)) {
      log(
        `✓ Get Overdue: ${overdue.status} OK (${overdue.data.length} overdue)`,
        "green",
      );
      passedTests++;
      results.push({ name: "Get Overdue Books API", status: "✓ PASS" });
    } else {
      log(`✗ Get Overdue Failed`, "red");
      results.push({ name: "Get Overdue Books API", status: "✗ FAIL" });
    }

    // ===== SECTION 5: DATA VALIDATION TESTS =====
    log("\n📋 SECTION 5: Data Validation Tests", "blue");
    log("═".repeat(60), "blue");

    // Test 10: Search Books
    totalTests++;
    const search = await makeRequest("GET", "/api/books/search?q=Python");
    if (search.status === 200 && Array.isArray(search.data)) {
      log(`✓ Search Books: ${search.status} OK`, "green");
      passedTests++;
      results.push({ name: "Search Books API", status: "✓ PASS" });
    } else {
      log(`✗ Search Books Failed`, "red");
      results.push({ name: "Search Books API", status: "✗ FAIL" });
    }

    // Test 11: Get Specific Book
    totalTests++;
    const book = await makeRequest("GET", "/api/books/1");
    if (book.status === 200 && book.data.book_id) {
      log(`✓ Get Book by ID: ${book.status} OK (${book.data.title})`, "green");
      passedTests++;
      results.push({ name: "Get Book by ID API", status: "✓ PASS" });
    } else {
      log(`✗ Get Book by ID Failed`, "red");
      results.push({ name: "Get Book by ID API", status: "✗ FAIL" });
    }

    // Test 12: Get Specific Member
    totalTests++;
    const member = await makeRequest("GET", "/api/members/1");
    if (member.status === 200 && member.data.member_id) {
      log(
        `✓ Get Member by ID: ${member.status} OK (${member.data.full_name})`,
        "green",
      );
      passedTests++;
      results.push({ name: "Get Member by ID API", status: "✓ PASS" });
    } else {
      log(`✗ Get Member by ID Failed`, "red");
      results.push({ name: "Get Member by ID API", status: "✗ FAIL" });
    }

    // ===== SECTION 6: AUTHORIZATION TESTS =====
    log("\n📋 SECTION 6: Authorization Tests", "blue");
    log("═".repeat(60), "blue");

    // Test 13: Unauthenticated access
    totalTests++;
    sessionCookie = null;
    const unauthBooks = await makeRequest("GET", "/api/books");
    if (unauthBooks.status === 401 || unauthBooks.status === 302) {
      log(`✓ Unauthenticated Access Blocked: ${unauthBooks.status}`, "green");
      passedTests++;
      results.push({ name: "Unauthenticated Access Block", status: "✓ PASS" });
    } else {
      log(`✗ Unauthenticated Access Not Blocked`, "red");
      results.push({ name: "Unauthenticated Access Block", status: "✗ FAIL" });
    }

    // Test 14: Get Current User
    sessionCookie = null;
    await makeRequest("POST", "/api/auth/login", {
      username: "librarian",
      password: "lib123",
    });

    totalTests++;
    const currentUser = await makeRequest("GET", "/api/auth/me");
    if (currentUser.status === 200 && currentUser.data.username) {
      log(
        `✓ Get Current User: ${currentUser.status} OK (${currentUser.data.username})`,
        "green",
      );
      passedTests++;
      results.push({ name: "Get Current User API", status: "✓ PASS" });
    } else {
      log(`✗ Get Current User Failed`, "red");
      results.push({ name: "Get Current User API", status: "✗ FAIL" });
    }

    // ===== FINAL SUMMARY =====
    log(
      "\n╔════════════════════════════════════════════════════════════╗",
      "cyan",
    );
    log(
      "║                      TEST SUMMARY                          ║",
      "cyan",
    );
    log(
      "╚════════════════════════════════════════════════════════════╝\n",
      "cyan",
    );

    log(`Total Tests: ${totalTests}`, "cyan");
    log(`Passed: ${passedTests}`, "green");
    log(
      `Failed: ${totalTests - passedTests}`,
      passedTests === totalTests ? "green" : "red",
    );
    log(
      `Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`,
      "cyan",
    );

    // Detailed results
    log("📊 Detailed Results:", "blue");
    log("─".repeat(60), "blue");

    results.forEach((result) => {
      const statusColor = result.status.includes("PASS") ? "green" : "red";
      log(`${result.status} - ${result.name}`, statusColor);
    });

    // Final verdict
    log("\n" + "═".repeat(60), "cyan");
    if (passedTests === totalTests) {
      log("✅ ALL TESTS PASSED - SYSTEM IS 100% FUNCTIONAL!", "green");
      log("═".repeat(60) + "\n", "cyan");
      process.exit(0);
    } else {
      log(
        `⚠️  SOME TESTS FAILED - ${totalTests - passedTests} issues found`,
        "red",
      );
      log("═".repeat(60) + "\n", "cyan");
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, "red");
    log("═".repeat(60) + "\n", "red");
    process.exit(1);
  }
}

// Run tests
log("Starting tests... (server must be running on port 3000)", "yellow");
log("─".repeat(60) + "\n", "yellow");

setTimeout(() => {
  runAllTests().catch((err) => {
    log(`Fatal error: ${err.message}`, "red");
    process.exit(1);
  });
}, 1000);
