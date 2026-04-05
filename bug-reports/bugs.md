# Phase 1: Static Analysis Bug Report

| Bug ID | Title | Location | Severity | Description |
| :--- | :--- | :--- | :--- | :--- |
| BUG-001 | Unused Security Middleware | `src/routes/borrowing.js` | 🔴 Critical | พบ `requireAdmin` ถูกเรียกมาแต่ไม่ได้ใช้ ทำให้ระบบอาจขาดการเช็คสิทธิ์ Admin |
| BUG-002 | Unused Database Connection | `src/app.js` | 🟡 Low | ตัวแปร `db` ถูกประกาศทิ้งไว้แต่ไม่ได้ใช้งาน |
| BUG-003 | Unused Middleware Parameter | `src/app.js` | 🟡 Low | พารามิเตอร์ `next` ใน Error Handler ไม่ถูกเรียกใช้งาน |