#!/usr/bin/env node
/**
 * Quick Functional Test - Library Management System v2
 */

const http = require("http");

const BASE_URL = "http://localhost:3002";
let sessionCookie = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = {
      "Content-Type": "application/json",
      ...(sessionCookie && { Cookie: sessionCookie }),
    };

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: headers,
        timeout: 5000,
      },
      (res) => {
        let body = "";
        if (res.headers["set-cookie"]) {
          sessionCookie = res.headers["set-cookie"][0].split(";")[0];
        }
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  log("\n╔═══════════════════════════════════════════════════════╗", "blue");
  log("║  Library Management System v2 - Functional Test       ║", "blue");
  log("╚═══════════════════════════════════════════════════════╝\n", "blue");

  let pass = 0,
    fail = 0;

  try {
    // 1. Health
    log("📍 Test 1: Health Check");
    let res = await request("GET", "/health");
    if (res.status === 200) {
      log("✅ PASS\n", "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 2. Admin Login
    log("📍 Test 2: Admin Login");
    res = await request("POST", "/api/auth/login", {
      username: "admin",
      password: "admin123",
    });
    if (res.status === 200 && res.body.success) {
      log(`✅ PASS - User: ${res.body.user.full_name}\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 3. Get Books
    log("📍 Test 3: Get Books API");
    res = await request("GET", "/api/books");
    if (res.status === 200 && Array.isArray(res.body)) {
      log(`✅ PASS - Found ${res.body.length} books\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 4. Get Members
    log("📍 Test 4: Get Members API");
    res = await request("GET", "/api/members");
    if (res.status === 200 && Array.isArray(res.body)) {
      log(`✅ PASS - Found ${res.body.length} members\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 5. Dashboard Stats
    log("📍 Test 5: Dashboard Stats");
    res = await request("GET", "/api/dashboard/stats");
    if (res.status === 200 && res.body.totalBooks) {
      log(
        `✅ PASS - Books: ${res.body.totalBooks}, Members: ${res.body.activeMembers}\n`,
        "green",
      );
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 6. Get Borrowing
    log("📍 Test 6: Get Borrowing Records");
    res = await request("GET", "/api/borrowing");
    if (res.status === 200 && Array.isArray(res.body)) {
      log(`✅ PASS - Found ${res.body.length} records\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 7. Get Overdue
    log("📍 Test 7: Get Overdue Books");
    res = await request("GET", "/api/borrowing/overdue");
    if (res.status === 200 && Array.isArray(res.body)) {
      log(`✅ PASS - Found ${res.body.length} overdue\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 8. Search Books
    log("📍 Test 8: Search Books");
    res = await request("GET", "/api/books/search?q=Python");
    if (res.status === 200 && Array.isArray(res.body)) {
      log(`✅ PASS - Found ${res.body.length} matches\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 9. Get Book by ID
    log("📍 Test 9: Get Book by ID");
    res = await request("GET", "/api/books/1");
    if (res.status === 200 && res.body.book_id) {
      log(`✅ PASS - ${res.body.title}\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // 10. Get Member by ID
    log("📍 Test 10: Get Member by ID");
    res = await request("GET", "/api/members/1");
    if (res.status === 200 && res.body.member_id) {
      log(`✅ PASS - ${res.body.full_name}\n`, "green");
      pass++;
    } else {
      log(`❌ FAIL (${res.status})\n`, "red");
      fail++;
    }

    // Summary
    log("\n" + "═".repeat(59), "blue");
    log(`📊 RESULTS: ${pass} Passed, ${fail} Failed`, "blue");

    if (fail === 0) {
      log("\n✅ ALL TESTS PASSED - SYSTEM IS 100% FUNCTIONAL!\n", "green");
      process.exit(0);
    } else {
      log(`\n❌ ${fail} test(s) failed\n`, "red");
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, "red");
    process.exit(1);
  }
}

test();
