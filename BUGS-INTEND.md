# 10 Bugs ที่ตั้งใจ - Library Management System v2

## วัตถุประสงค์

ไฟล์นี้อธิบาย **10 Bugs ที่ตั้งใจให้มี** ในโปรเจค Library Management System v2 เพื่อเป็นเครื่องมือการเรียนรู้

นักเรียนต้อง:

1. **หา bugs** เหล่านี้
2. **แก้ไข bugs**
3. **ทำความเข้าใจ** สาเหตุและวิธีแก้ไข
4. **เรียนรู้** จากแต่ละปัญหา

---

## Bug ที่ตั้งใจให้มี

### กลุ่ม 1: Field Mapping Bugs (3 bugs)

#### BUG #1: Book Field ID Mismatch

**สาเหตุโดยจำเจ:** Database ใช้ `book_id` แต่ API ต่อจะส่ง `id`

**ที่พบ:**

- `src/models/Book.js` - ไม่มี SQL alias
- `views/books.html` - คาดหวัง `book.id`

**ผลกระทบ:**

- ไม่สามารถแก้ไขหนังสือ
- Dropdown ไม่แสดงรายการ

**การแก้ไข:**

```javascript
// ต้องเพิ่ม alias
SELECT book_id as id, * FROM books
```

**สิ่งที่นักเรียนเรียนรู้:**

- SQL aliases ใช้เพื่ออะไร
- Field mapping ระหว่าง backend-frontend
- REST API conventions

---

#### BUG #2: Member Field ID Mismatch

**สาเหตุโดยจำเจ:** Member dropdown ใช้ชื่อ field ต่างกัน

**ที่พบ:**

- `src/models/Member.js`
- `views/members.html` และ `views/borrowing.html`

**ผลกระทบ:**

- Undefined values ในตาราง
- ไม่สามารถเลือกสมาชิกได้

**การแก้ไข:**

```javascript
// ต้องใช้ member.member_id อย่างสม่ำเสมอ
SELECT * FROM members  // Returns member_id naturally
```

**สิ่งที่นักเรียนเรียนรู้:**

- Consistency ในการใช้ field names
- Debugging undefined values
- ความสำคัญของ naming conventions

---

#### BUG #3: Borrowing Field Mapping Mismatch

**สาเหตุโดยจำเจ:** Borrowing API ส่งหลายชื่อ field ผิด

**ที่พบ:**

- `src/models/Borrowing.js` - ไม่มี JOIN
- API ส่ง `borrow_id` แทน `id`
- API ส่ง `full_name` แทน `member_name`

**ผลกระทบ:**

- ตาราง borrowing แสดง undefined
- View Details ไม่เวิ์ก

**การแก้ไข:**

```javascript
// ต้องเพิ่ม JOINs และ aliases
SELECT
  b.borrow_id as id,
  b.*,
  m.full_name as member_name,
  bk.title as book_title
FROM borrowing b
JOIN members m ON b.member_id = m.member_id
JOIN books bk ON b.book_id = bk.book_id
```

**สิ่งที่นักเรียนเรียนรู้:**

- SQL JOINs
- Multiple aliases
- Complex field mapping

---

### กลุ่ม 2: Route Configuration Bugs (3 bugs)

#### BUG #4: Borrow Endpoint Route Mismatch

**สาเหตุโดยจำเจ:** Backend กำหนด `POST /borrowing/borrow` แต่ frontend เรียก `POST /borrowing`

**ที่พบ:**

- `src/routes/borrowing.js` - route ชื่อ `/borrow`
- `views/borrowing.html` - เรียก `/api/borrowing`

**ผลกระทบ:**

- "Error: Not found" เมื่อ Save New Borrow
- ไม่สามารถสร้าง borrowing record

**การแก้ไข:**

```javascript
// ต้องเปลี่ยน
router.post("/", BorrowingController.borrow); // ไม่ใช่ /borrow
```

**สิ่งที่นักเรียนเรียนรู้:**

- REST API best practices
- POST /resource convention
- Frontend-backend synchronization

---

#### BUG #5: Return Book HTTP Method Mismatch

**สาเหตุโดยจำเจ:** Route ใช้ `POST` แต่ฟีเจอร์คือการ **update** (ต้อง PUT)

**ที่พบ:**

- `src/routes/borrowing.js`
- `router.post("/:borrowId/return", ...)` ต้อง PUT

**ผลกระทบ:**

- Return button ให้ 404 error
- ไม่สามารถคืนหนังสือ

**การแก้ไข:**

```javascript
// ต้องเปลี่ยนเป็น PUT (อัปเดตทรัพยากร)
router.put("/:borrowId/return", BorrowingController.returnBook);
```

**สิ่งที่นักเรียนเรียนรู้:**

- HTTP methods: GET, POST, PUT, DELETE
- POST = สร้าง, PUT = อัปเดต
- Semantic HTTP

---

#### BUG #6: Route Ordering Issue (Express Router Precedence)

**สาเหตุโดยจำเจ:** Express จับคู่เส้นทางตามลำดับ → generic routes จับคู่ก่อน specific routes

**ที่พบ:**

- `src/routes/borrowing.js`
- `/:borrowId` ถูกกำหนดก่อน `/borrowed` ❌

**ผลกระทบ:**

- `GET /borrowing/borrowed` ถูกจับเป็น `/:borrowId` ที่ borrowId="borrowed"
- View Borrowed ไม่ทำงาน

**การแก้ไข:**

```javascript
// Specific routes ต้องมาก่อน generic routes
router.get('/borrowed', ...);       // ✅
router.get('/overdue', ...);        // ✅
router.get('/member/:memberId', ...); // ✅
router.get('/:borrowId', ...);      // generic มาก่อนสุด
```

**สิ่งที่นักเรียนเรียนรู้:**

- Express routing mechanism
- Route precedence
- Debugging routing issues

---

### กลุ่ม 3: Missing Features Bugs (2 bugs)

#### BUG #7: Missing Navigation Pages

**สาเหตุโดยจำเจ:** Dashboard แสดงปุ่มนำทาง แต่หน้า HTML ไม่มี

**ที่พบ:**

- Dashboard ปุ่ม Books, Members, Borrowing, Reports
- ไม่มี `views/books.html`, `views/members.html` เป็นต้น

**ผลกระทบ:**

- 404 error เมื่อคลิกปุ่ม
- ไม่สามารถเข้าหน้า feature ได้

**การแก้ไข:**

```javascript
// ต้องสร้าง HTML files และ routes
app.get("/books", (req, res) => res.render("books"));
app.get("/members", (req, res) => res.render("members"));
// เป็นต้น
```

**สิ่งที่นักเรียนเรียนรู้:**

- Frontend-backend coordination
- Routing to HTML views
- Project structure

---

#### BUG #8: Missing Borrowing Detail Endpoint

**สาเหตุโดยจำเจ:** Frontend เรียก `GET /borrowing/:borrowId` แต่ endpoint ไม่มี

**ที่พบ:**

- `views/borrowing.html` - มี viewDetails() function
- `src/routes/borrowing.js` - ไม่มี `GET /:borrowId` route
- `BorrowingController.js` - ไม่มี findById() method

**ผลกระทบ:**

- "View Details" button ไม่ทำงาน
- 404 error

**การแก้ไข:**

```javascript
// ต้องเพิ่ม route
router.get('/:borrowId', BorrowingController.findById);

// และเพิ่ม controller method
async findById(req, res) { ... }
```

**สิ่งที่นักเรียนเรียนรู้:**

- Endpoint design
- Controller methods
- Complete feature implementation

---

### กลุ่ม 4: Code Quality Bugs (2 bugs)

#### BUG #9: Members.html File Corruption

**สาเหตุโดยจำเจ:** Multiple `replace_string_in_file` operation ทำให้ code สลับผสมกัน

**ที่พบ:**

- `views/members.html`
- HTML form closing tags อยู่ในตัว JavaScript functions
- Code structure ผิด

**ผลกระทบ:**

- Browser console มี syntax errors
- Members page ไม่โหลด
- All member features ไม่ทำงาน

**การแก้ไข:**

```javascript
// ต้องเขียนใหม่ทั้งไฟล์
// Structure: HTML > includes
// Modals > JavaScript at bottom
```

**สิ่งที่นักเรียนเรียนรู้:**

- Code structure importance
- File corruption debugging
- Batch operations vs sequential operations
- Testing after changes

---

#### BUG #10: Jest Configuration Syntax Error

**สาเหตุโดยจำเจ:** `jest.config.js` ใช้ JSON syntax แทน JavaScript module.exports

**ที่พบ:**

- `jest.config.js`
- ```javascript
  // ผิด
  {
    "testEnvironment": "node"
  }

  // ถูก
  module.exports = {
    testEnvironment: 'node'
  };
  ```

**ผลกระทบ:**

- Jest ไม่สามารถโหลด config
- Test ไม่ทำงาน

**การแก้ไข:**

```javascript
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js"],
};
```

**สิ่งที่นักเรียนเรียนรู้:**

- Node.js module exports
- Configuration files
- Test framework setup

---

## 📊 สรุป Bug ทั้งหมด

| #   | ชื่อ Bug                 | ประเภท          | ความรุนแรง | สิ่งที่เรียนรู้                  |
| --- | ------------------------ | --------------- | ---------- | -------------------------------- |
| 1   | Book ID Mismatch         | Field Mapping   | 🔴 สูง     | SQL aliases, API conventions     |
| 2   | Member ID Mismatch       | Field Mapping   | 🔴 สูง     | Consistency, naming conventions  |
| 3   | Borrowing Field Mismatch | Field Mapping   | 🔴 สูง     | SQL JOINs, complex mapping       |
| 4   | Borrow Route Mismatch    | Route Config    | 🔴 สูง     | REST conventions, POST /resource |
| 5   | Return HTTP Method       | Route Config    | 🔴 สูง     | HTTP methods, PUT for updates    |
| 6   | Route Ordering           | Route Config    | 🔴 สูง     | Express routing, precedence      |
| 7   | Missing Pages            | Missing Feature | 🔴 สูง     | Frontend structure, routing      |
| 8   | Missing Endpoint         | Missing Feature | 🔴 สูง     | Endpoint design, controllers     |
| 9   | File Corruption          | Code Quality    | 🔴 วิกฤต   | Code structure, batch operations |
| 10  | Jest Config              | Code Quality    | 🟡 ปานกลาง | Node.js modules, config          |

---

## ขั้นตอนการเรียนรู้

### **Level 1: Recognition**

- อ่าน Bugs ทั้งหมด
- เข้าใจสาเหตุของแต่ละ bug
- บอกได้ว่า bug อยู่ที่ไหน

### **Level 2: Debugging**

- ใช้ browser DevTools
- ใช้ Network tab ดูการเรียก API
- อ่าน error messages อย่างจริงจัง
- หาปัญหาในโค้ด

### **Level 3: Fixing**

- แก้ไข bugs ทีละตัว
- ทดสอบหลังแก้ไข
- ตรวจสอบ side effects

### **Level 4: Understanding**

- เข้าใจทำไมต้องแก้แบบนี้
- สอนเพื่อน
- เขียน documentation

### **Level 5: Prevention**

- รู้วิธีหลีกเลี่ยง bugs เหล่านี้
- ใช้ best practices
- Test code อย่างถูกต้อง

---

## 🛠️ Tools ที่ต้องใช้

| Tool             | ใช้ที่                         | Buy/Free |
| ---------------- | ------------------------------ | -------- |
| Browser DevTools | Debugging network & console    | Free     |
| Postman/Insomnia | Test API endpoints             | Free     |
| VS Code          | Code editing & debugging       | Free     |
| Terminal/Console | Run npm commands               | Free     |
| Git              | Version control, track changes | Free     |

---

## คำแนะนำ

1. **อ่าน BUGS.md** - ดูวิธีแก้ไขที่ถูกต้องแล้ว
2. **ลอง Debug เอง ก่อน** - ไม่ต้องมองเฉลย
3. **ใช้ console.log()** - ดูค่า variables ที่ส่งไป
4. **ดู Network tab** - ดูค่า API responses
5. **ทดสอบทีละขั้น** - ไม่ต้อง fix ทั้งหมดพร้อม
6. **เขียน Comments** - อธิบายว่าทำไมต้องแก้แบบนี้

---

## Learning Outcomes

หลังจากแก้ไขทั้ง 10 bugs นี้ นักเรียนจะสามารถ:

**Debug web applications** ได้อย่างมีประสิทธิภาพ  
**เข้าใจ Frontend-Backend communication**  
**รู้ REST API conventions** และเมธอด  
**คิดเรื่อง SQL และ field mapping**  
**แก้ไข routing issues** ใน Express  
**รักษา code quality** และ file structure  
**เขียน clean code** ที่ลดบั๊ก

---
