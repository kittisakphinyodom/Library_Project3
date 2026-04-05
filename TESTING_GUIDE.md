# Testing Guide - Library Management System v2

คู่มือการเขียน test cases สำหรับระบบจัดการห้องสมุด

---

## 📖 สารบัญ

1. [Unit Testing with Jest](#unit-testing-with-jest)
2. [Integration Testing with Supertest](#integration-testing-with-supertest)
3. [E2E Testing with Playwright](#e2e-testing-with-playwright)
4. [Test Case Examples](#test-case-examples)
5. [Best Practices](#best-practices)

---

## Unit Testing with Jest

### การติดตั้ง

Jest ถูก install มาแล้วใน `package.json`

```bash
npm install --save-dev jest supertest
```

### Configuration

ไฟล์ `jest.config.js` ได้ setup มาแล้ว

### เขียน Unit Test

**ตัวอย่าง: ทดสอบ query helper**

```javascript
// src/__tests__/models/query.test.js

const { getOne, getAll, run } = require("../../models/query");

describe("Query Helper Functions", () => {
  test("getOne should return a single row", async () => {
    const result = await getOne("SELECT * FROM books WHERE book_id = ?", [1]);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("title");
  });

  test("getAll should return an array", async () => {
    const results = await getAll("SELECT * FROM books LIMIT 5");

    expect(Array.isArray(results)).toBe(true);
  });
});
```

### รันทดสอบ

```bash
# รันทั้งหมด
npm test

# รันไฟล์เฉพาะ
npm test src/__tests__/Auth.test.js

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

---

## Integration Testing with Supertest

Supertest ใช้สำหรับ test HTTP requests

### ตัวอย่างพื้นฐาน

```javascript
const request = require("supertest");
const app = require("../app");

describe("Books API Integration Tests", () => {
  test("should get all books", async () => {
    const response = await request(app)
      .get("/api/books")
      .set("Authorization", "Bearer token"); // หากใช้ authorization

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Test with Session/Cookies

```javascript
describe("Authenticated API Calls", () => {
  let sessionCookie;

  beforeAll(async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    const cookies = loginResponse.headers["set-cookie"];
    sessionCookie = cookies ? cookies[0].split(";")[0] : "";
  });

  test("should get books with authentication", async () => {
    const response = await request(app)
      .get("/api/books")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
  });
});
```

---

## E2E Testing with Playwright

### การติดตั้ง

```bash
npm install --save-dev @playwright/test
```

### สร้าง Configuration

สร้างไฟล์ `playwright.config.js`:

```javascript
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### ตัวอย่าง E2E Test

สร้างไฟล์ `tests/e2e/login.spec.js`:

```javascript
import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("should login successfully", async ({ page }) => {
    // ไปที่หน้า login
    await page.goto("/login");

    // เขียน username
    await page.fill("#username", "admin");

    // เขียน password
    await page.fill("#password", "admin123");

    // คลิก login button
    await page.click('button[type="submit"]');

    // รอสำเร็จ
    await expect(page).toHaveURL("/dashboard");
  });

  test("should show error with wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.fill("#username", "admin");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    // ตรวจสอบ error message
    await expect(page.locator(".alert-danger")).toBeVisible();
  });
});
```

### รัน Playwright Tests

```bash
# รันทั้งหมด
npx playwright test

# รันแบบ headed mode (เห็น browser)
npx playwright test --headed

# รันไฟล์เฉพาะ
npx playwright test tests/e2e/login.spec.js

# Debug mode
npx playwright test --debug
```

---

## Test Case Examples

### ตัวอย่าง 1: Test Book Creation

```javascript
describe("Books - Create", () => {
  test("should create a new book with valid data", async () => {
    const response = await request(app)
      .post("/api/books")
      .set("Cookie", sessionCookie)
      .send({
        title: "Software Testing Fundamentals",
        author: "John Doe",
        isbn: "978-TEST-001",
        publisher: "Test Publisher",
        publicationYear: 2024,
        category: "Testing",
        totalCopies: 3,
        shelfLocation: "A-200",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("book_id");
  });

  test("should reject duplicate ISBN", async () => {
    // หนังสือเล่มแรก
    await request(app).post("/api/books").set("Cookie", sessionCookie).send({
      title: "Book 1",
      author: "Author 1",
      isbn: "DUP-001",
      totalCopies: 1,
    });

    // หนังสือเล่มที่สอง (duplicate ISBN)
    const response = await request(app)
      .post("/api/books")
      .set("Cookie", sessionCookie)
      .send({
        title: "Book 2",
        author: "Author 2",
        isbn: "DUP-001",
        totalCopies: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("ISBN");
  });

  test("should return 400 without required fields", async () => {
    const response = await request(app)
      .post("/api/books")
      .set("Cookie", sessionCookie)
      .send({
        title: "Book Without Author",
        // missing author and totalCopies
      });

    expect(response.status).toBe(400);
  });
});
```

### ตัวอย่าง 2: Test Borrowing Logic

```javascript
describe("Borrowing - Business Logic", () => {
  test("should not allow borrowing when member has max books", async () => {
    // สมมุติว่าสมาชิก M001 มี max_books = 3
    // และได้ยืมหนังสือไปแล้ว 3 เล่ม

    const response = await request(app)
      .post("/api/borrowing/borrow")
      .set("Cookie", sessionCookie)
      .send({
        memberId: 1,
        bookId: 2,
        borrowDate: "2024-12-10",
        dueDate: "2024-12-24",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("maximum");
  });

  test("should calculate fine correctly", async () => {
    // ยืมวันที่ 10 ธ.ค. ครบกำหนด 24 ธ.ค.
    // คืนวันที่ 31 ธ.ค. (เกิน 7 วัน)
    // ค่าปรับ = 7 * 10 = 70 บาท

    const response = await request(app)
      .post("/api/borrowing/1/return")
      .set("Cookie", sessionCookie)
      .send({
        returnDate: "2024-12-31",
      });

    expect(response.status).toBe(200);
    expect(response.body.fineAmount).toBe(70);
  });

  test("should not allow borrowing unavailable book", async () => {
    const response = await request(app)
      .post("/api/borrowing/borrow")
      .set("Cookie", sessionCookie)
      .send({
        memberId: 1,
        bookId: 5, // หนังสือที่ available_copies = 0
        borrowDate: "2024-12-10",
        dueDate: "2024-12-24",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("not available");
  });
});
```

### ตัวอย่าง 3: Test Search Function

```javascript
describe("Search Functionality", () => {
  test("should search books by title", async () => {
    const response = await request(app)
      .get("/api/books/search")
      .query({ q: "Python" })
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toContain("Python");
  });

  test("should search books by author", async () => {
    const response = await request(app)
      .get("/api/books/search")
      .query({ q: "สมศักดิ์" })
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
  });

  test("should search books by ISBN", async () => {
    const response = await request(app)
      .get("/api/books/search")
      .query({ q: "978-616-123-456-7" })
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("should return empty array for no match", async () => {
    const response = await request(app)
      .get("/api/books/search")
      .query({ q: "NONEXISTENT-BOOK-XYZ" })
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("should return 400 for empty query", async () => {
    const response = await request(app)
      .get("/api/books/search")
      .query({ q: "" })
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(400);
  });
});
```

---

## Best Practices

### 1. Test Structure

```javascript
describe("Feature Name", () => {
  // Setup
  beforeAll(async () => {
    // เตรียมข้อมูลเบื้องต้น
  });

  beforeEach(async () => {
    // เตรียมก่อนแต่ละ test
  });

  // Tests
  test("should do something", () => {
    // Arrange: เตรียมข้อมูล
    // Act: ทำการทดสอบ
    // Assert: ตรวจสอบผลลัพธ์
  });

  // Cleanup
  afterEach(async () => {
    // ทำความสะอาดหลังแต่ละ test
  });

  afterAll(async () => {
    // ทำความสะอาดหลังทั้ง test suite
  });
});
```

### 2. AAA Pattern (Arrange, Act, Assert)

```javascript
test("should update book availability", async () => {
  // ARRANGE: เตรียมข้อมูล
  const bookId = 1;
  const initialBook = await Book.findById(bookId);
  const initialCopies = initialBook.available_copies;

  // ACT: ทำการทดสอบ
  await Book.updateAvailableCopies(bookId, initialCopies - 1);

  // ASSERT: ตรวจสอบผลลัพธ์
  const updatedBook = await Book.findById(bookId);
  expect(updatedBook.available_copies).toBe(initialCopies - 1);
});
```

### 3. Test Naming

✅ ชื่อที่ดี:

- `should return 200 when creating book with valid data`
- `should render error message when login fails`
- `should calculate fine correctly for overdue books`

❌ ชื่อที่ไม่ดี:

- `test1`
- `book creation`
- `error handling`

### 4. Avoid Test Interdependence

```javascript
// ❌ ไม่ดี: test ขึ้นอยู่กับผลของ test ก่อนหน้า
describe('Books', () => {
    let bookId;

    test('should create a book', async () => {
        const response = await request(app).post('/api/books')...;
        bookId = response.body.book_id; // ขึ้นอยู่ bookId นี้
    });

    test('should get the book', async () => {
        const response = await request(app).get(`/api/books/${bookId}`)...;
    });
});

// ✅ ดี: แต่ละ test เป็นอิสระ
describe('Books', () => {
    test('should create and get a book', async () => {
        const createResponse = await request(app).post('/api/books')...;
        const bookId = createResponse.body.book_id;

        const getResponse = await request(app).get(`/api/books/${bookId}`)...;
        expect(getResponse.status).toBe(200);
    });
});
```

### 5. Test Coverage

ตรวจสอบ test coverage:

```bash
npm test -- --coverage
```

เป้าหมาย:

- Statements: > 70%
- Branches: > 60%
- Functions: > 70%
- Lines: > 70%

---

## Tips and Tricks

### เทสท์ที่ยุ่งยากขึ้น (Edge Cases)

```javascript
describe("Edge Cases", () => {
  test("should handle borrowing on same day as due date", async () => {
    const response = await request(app)
      .post("/api/borrowing/borrow")
      .set("Cookie", sessionCookie)
      .send({
        memberId: 1,
        bookId: 2,
        borrowDate: "2024-12-24",
        dueDate: "2024-12-24", // same day
      });

    expect([201, 400]).toContain(response.status);
  });

  test("should handle very long book titles", async () => {
    const longTitle = "a".repeat(500);

    const response = await request(app)
      .post("/api/books")
      .set("Cookie", sessionCookie)
      .send({
        title: longTitle,
        author: "Test",
        totalCopies: 1,
      });

    expect([201, 400]).toContain(response.status);
  });
});
```

### Data Validation Tests

```javascript
describe("Input Validation", () => {
  test("should reject negative total copies", async () => {
    const response = await request(app)
      .post("/api/books")
      .set("Cookie", sessionCookie)
      .send({
        title: "Test",
        author: "Test",
        totalCopies: -5,
      });

    expect(response.status).toBe(400);
  });

  test("should reject invalid email format", async () => {
    const response = await request(app)
      .post("/api/members")
      .set("Cookie", sessionCookie)
      .send({
        memberCode: "M999",
        fullName: "Test",
        email: "not-an-email",
        memberType: "student",
      });

    expect(response.status).toBe(400);
  });
});
```

---

## ทรัพยากรเพิ่มเติม

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Happy Testing! 🧪**
