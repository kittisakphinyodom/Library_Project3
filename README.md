# Library Management System v2 - Node.js Edition

ระบบจัดการห้องสมุดแบบง่ายๆ สำหรับการเรียนการสอนวิชา Software Testing and Evaluation

เขียนด้วย: **Node.js + Express + SQLite**

## 🎯 วัตถุประสงค์

ระบบนี้ออกแบบมาเพื่อใช้ในการเรียนการสอน โดยมี **bugs ที่ฝังไว้อย่างตั้งใจ** เพื่อให้ผู้เรียนฝึกฝน:

- การหา bugs ด้วยเทคนิคต่างๆ
- การเขียน test cases
- การทดสอบซอฟต์แวร์
- การเขียน bug reports
- การใช้ Jest สำหรับ unit testing
- การใช้ Playwright สำหรับ integration testing

## 📋 ข้อมูลระบบ

- **Backend:** Node.js + Express
- **Database:** SQLite
- **Frontend:** HTML + Bootstrap + JavaScript
- **Session:** Express Session
- **Testing:** Jest, Supertest, Playwright

## 🚀 การติดตั้งและรันระบบ

### วิธีที่ 1: ใช้ Docker (แนะนำ)

#### ข้อกำหนดเบื้องต้น

- Docker
- Docker Compose

#### ขั้นตอน

1. **Clone หรือ download โปรเจค**

2. **เปิด Terminal/Command Prompt ที่โฟลเดอร์โปรเจค**

3. **รันคำสั่ง:**

```bash
docker-compose up -d
```

4. **เข้าใช้งานผ่าน browser:**

   ```
   http://localhost:3000
   ```

5. **หลังเสร็จสิ้น หยุด container:**

```bash
docker-compose down
```

### วิธีที่ 2: รันในเครื่องโดยตรง

#### ข้อกำหนดเบื้องต้น

- Node.js 16+
- npm

#### ขั้นตอน

1. **Install dependencies:**

```bash
npm install
```

2. **Copy environment file:**

```bash
cp .env.example .env
```

3. **รันระบบ:**

```bash
npm start
```

หรือสำหรับ development mode (auto-reload):

```bash
npm run dev
```

4. **เข้าใช้งาน:**
   ```
   http://localhost:3000
   ```

## 🔐 Login Information

### Demo Accounts

| Username    | Password   | Role      |
| ----------- | ---------- | --------- |
| `admin`     | `admin123` | Admin     |
| `librarian` | `lib123`   | Librarian |

## 📁 โครงสร้างโปรเจค

```
Library-Management-v2/
├── src/
│   ├── app.js                 # Express server setup
│   ├── database.js            # Database initialization
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── BookController.js
│   │   ├── MemberController.js
│   │   └── BorrowingController.js
│   ├── models/
│   │   ├── query.js          # Database helper functions
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Member.js
│   │   └── Borrowing.js
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   └── routes/
│       ├── auth.js
│       ├── dashboard.js
│       ├── books.js
│       ├── members.js
│       └── borrowing.js
├── views/
│   ├── login.html            # Login page
│   └── dashboard.html        # Dashboard page
├── database/
│   └── schema.sql            # SQLite database schema
├── public/                    # Static files
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🎓 API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Dashboard

- `GET /api/dashboard/stats` - Get system statistics

### Books

- `GET /api/books` - List all books
- `GET /api/books/:id` - Get book details
- `GET /api/books/search?q=query` - Search books
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Members

- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create member (Admin only)
- `PUT /api/members/:id` - Update member (Admin only)
- `DELETE /api/members/:id` - Delete member (Admin only)

### Borrowing

- `GET /api/borrowing` - List all borrowing records
- `GET /api/borrowing/borrowed` - List currently borrowed books
- `GET /api/borrowing/overdue` - List overdue books
- `GET /api/borrowing/member/:memberId` - Get member's borrowing history
- `POST /api/borrowing/borrow` - Borrow book
- `POST /api/borrowing/:borrowId/return` - Return book
- `PUT /api/borrowing/:borrowId/extend` - Extend due date

## 💾 Database Schema

### Users Table

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'librarian')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Members Table

```sql
CREATE TABLE members (
    member_id INTEGER PRIMARY KEY,
    member_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    member_type TEXT CHECK(member_type IN ('student', 'teacher', 'public')),
    registration_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    max_books INTEGER DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table

```sql
CREATE TABLE books (
    book_id INTEGER PRIMARY KEY,
    isbn TEXT UNIQUE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT,
    publication_year INTEGER,
    category TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    shelf_location TEXT,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'unavailable')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Borrowing Table

```sql
CREATE TABLE borrowing (
    borrow_id INTEGER PRIMARY KEY,
    member_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'borrowed' CHECK(status IN ('borrowed', 'returned', 'overdue')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);
```

## 📝 Features

### 1. Dashboard

- แสดงสถิติของระบบ
- จำนวนหนังสือทั้งหมด
- จำนวนหนังสือที่มีให้ยืม
- จำนวนสมาชิกที่ใช้งาน
- จำนวนหนังสือที่ยืมไปแล้ว

### 2. Books Management

- เพิ่มหนังสือใหม่
- แก้ไขข้อมูลหนังสือ
- ลบหนังสือ
- ค้นหาหนังสือ
- ดูรายละเอียดหนังสือ

### 3. Members Management

- จดทะเบียนสมาชิกใหม่
- แก้ไขข้อมูลสมาชิก
- ลบสมาชิก (ถ้าไม่มีหนังสือที่ยืมไปแล้ว)
- ดูรายละเอียดสมาชิก

### 4. Borrowing Management

- ยืมหนังสือ
- คืนหนังสือและคำนวณค่าปรับ
- ขยายวันครบกำหนดการยืม
- ดูหนังสือที่ยืมไปแล้ว
- ดูหนังสือที่เกินกำหนดส่งคืน
- ดูประวัติการยืมของสมาชิก

## 🐛 Known Bugs (ฝังไว้อย่างตั้งใจ)

ระบบนี้มี bugs บางตัวที่ฝังไว้อย่างตั้งใจสำหรับการใช้ในการเรียน:

- [ ] Bug ในการคำนวณค่าปรับหนังสือที่เกินกำหนด
- [ ] Bug ในการตรวจสอบจำนวนหนังสือที่สมาชิกสามารถยืมได้
- [ ] Bug ในการ update สถานะหนังสือเมื่อสิ้นสุดการยืม
- [ ] SQL Injection ความเสี่ยงในการค้นหา
- [ ] Missing input validation ในบางฟังก์ชัน
- [ ] Race condition เมื่อจัดการ concurrent borrowing

ผู้เรียน: ลองหา bugs นี้ได้นะ! 😉

## 📚 การใช้งานสำหรับการเรียน

### สัปดาห์ที่ 1-2: Software Quality

- ให้ผู้เรียนทดลองใช้ระบบ
- วิเคราะห์ quality attributes
- ระบุ quality metrics ที่ใช้วัด

### สัปดาห์ที่ 3: Test Planning

- เขียน Test Plan
- กำหนด Test Strategy
- วางแผนการทดสอบแต่ละ module

### สัปดาห์ที่ 4, 6: Testing Techniques

- **Black Box Testing:**
  - ทดสอบการยืม/คืนหนังสือ
  - ทดสอบการคำนวณค่าปรับ
  - ทดสอบ search function
- **White Box Testing:**
  - วิเคราะห์ code coverage
  - ทดสอบทุก branch
  - ทดสอบ boundary conditions

### สัปดาห์ที่ 5: Code Review & Inspection

- Code inspection เพื่อหา bugs
- ใช้ checklist
- Peer review

### สัปดาห์ที่ 10-11: Test Case Design

- เขียน test cases สำหรับทุกฟังก์ชัน
- ออกแบบ test data
- ทำ traceability matrix

### สัปดาห์ที่ 12-13: Execute Tests

- รันระบบทดสอบ
- บันทึกผลลัพธ์
- เขียน bug reports

## ✅ Unit Testing with Jest

### ติดตั้ง Jest

```bash
npm install --save-dev jest supertest
```

### สร้าง test file

```bash
mkdir -p src/__tests__
```

### ตัวอย่าง test file: `src/__tests__/Book.test.js`

```javascript
const request = require("supertest");
const app = require("../app");

describe("Book Controller", () => {
  test("GET /api/books should return all books", async () => {
    const response = await request(app)
      .get("/api/books")
      .set("Cookie", "sessionId=test");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### รัน tests

```bash
npm test
```

## 🎭 Integration Testing with Playwright

### ติดตั้ง Playwright

```bash
npm install --save-dev @playwright/test
```

### สร้าง test file: `tests/e2e/login.spec.js`

```javascript
import { test, expect } from "@playwright/test";

test("should login successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page.fill("#username", "admin");
  await page.fill("#password", "admin123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("http://localhost:3000/dashboard");
});
```

### รัน E2E tests

```bash
npx playwright test
```

## 🔧 Environment Variables

สร้างไฟล์ `.env` จากไฟล์ `.env.example` และแก้ไขค่าตามต้องการ:

```
NODE_ENV=development
PORT=3000
SESSION_SECRET=your_secret_key_here_change_in_production
DATABASE_PATH=./database/library.db
```

## 📖 หนังสืออ้างอิง

ระบบมีหนังสือตัวอย่างดังนี้:

1. การเขียนโปรแกรม Python
2. โครงสร้างข้อมูล
3. วิศวกรรมซอฟต์แวร์
4. ฐานข้อมูล MySQL
5. การทดสอบซอฟต์แวร์
6. Harry Potter (ฉบับภาษาไทย)
7. เศรษฐศาสตร์พอเพียง
8. ประวัติศาสตร์ไทย

## 📊 Sample Data

ระบบมีข้อมูลตัวอย่างสำหรับการทดสอบ:

- **5 สมาชิก** (student, teacher, public)
- **8 เล่ม** ของหนังสือ
- **3 บันทึกการยืม** (รวม overdue records)

## 🆘 Troubleshooting

### ปัญหา: Cannot connect to database

**วิธีแก้:**

- ตรวจสอบว่าโฟลเดอร์ `database/` มีอยู่
- ตรวจสอบ `DATABASE_PATH` ใน `.env` ถูกต้อง
- ลองลบ `database/library.db` และรันระบบใหม่

### ปัญหา: Port 3000 already in use

**วิธีแก้:**

- เปลี่ยน PORT ใน `.env`
- หรือปิด process ที่ใช้ port 3000

### ปัญหา: Module not found

**วิธีแก้:**

```bash
rm -rf node_modules
npm install
```

---
