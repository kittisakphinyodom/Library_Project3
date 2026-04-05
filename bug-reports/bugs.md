# Phase 1: Static Analysis Report (ESLint)

| Bug ID | Title | File Location | Severity | Description |
| :--- | :--- | :--- | :--- | :--- |
| BUG-001 | **Security Risk:** Unused `requireAdmin` | `src/routes/borrowing.js` | 🔴 Critical | Middleware ตรวจสอบสิทธิ์ Admin ถูกเรียกมาแต่ไม่ได้ใช้ใน Route |
| BUG-002 | Unused `db` connection | `src/app.js` | 🟢 Low | ตัวแปรการเชื่อมต่อฐานข้อมูลไม่ได้ถูกใช้งานในไฟล์หลัก |
| BUG-003 | Unused `next` parameter | `src/app.js` | 🟢 Low | พารามิเตอร์ใน Middleware Error Handler ไม่ถูกเรียกใช้ |
| BUG-004 | Unused `db` in Borrowing | `src/controllers/BorrowingController.js` | 🟢 Low | มีการประกาศตัวแปร `db` ซ้ำซ้อนโดยไม่ได้ใช้งาน |
| BUG-005 | Unused `db` in Dashboard | `src/controllers/DashboardController.js` | 🟢 Low | ตัวแปร `db` ถูกจองหน่วยความจำไว้แต่ไม่ได้ใช้งานจริง |