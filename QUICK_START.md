# QUICK START - Library Management System v2

ระบบจัดการห้องสมุด เวอร์ชั่น Node.js + Express + SQLite

## ⚡ เริ่มต้นอย่างรวดเร็ว (5 นาที)

### วิธีที่ 1: Docker (แนะนำ - ง่ายที่สุด)

```bash
# ขั้นตอนที่ 1: เข้าไปในโฟลเดอร์ Library-Management-v2
cd Library-Management-v2

# ขั้นตอนที่ 2: รัน docker
docker-compose up -d

# ขั้นตอนที่ 3: เข้าใช้งาน
# เปิด browser และไปที่: http://localhost:3000
```

**ข้อมูล Login:**

- Username: `admin`
- Password: `admin123`

**หยุดระบบ:**

```bash
docker-compose down
```

---

### วิธีที่ 2: Node.js โดยตรง

```bash
# ขั้นตอนที่ 1: ติดตั้ง dependencies
cd Library-Management-v2
npm install

# ขั้นตอนที่ 2: สร้างไฟล์ .env
cp .env.example .env

# ขั้นตอนที่ 3: รันระบบ
npm start

# ขั้นตอนที่ 4: เข้าใช้งาน
# เปิด browser และไปที่: http://localhost:3000
```

---

## 🎯 หลังรันระบบได้แล้ว

1. **Login ด้วย account demo:**
   - Admin account: admin / admin123
   - Librarian account: librarian / lib123

2. **ลองใช้ฟังก์ชันต่างๆ:**
   - ดูสถิติระบบ
   - จัดการหนังสือ
   - จัดการสมาชิก
   - ยืม-คืนหนังสือ

3. **เตรียมตัวสำหรับการ Testing:**
   - ลองหา bugs ที่ฝังไว้
   - เขียน test cases
   - เขียน bug reports

---

## 📁 ที่อยู่โปรเจค

```
d:\01-Teaching\682\88734365\Library-Management-v2\
```

---

## 🚀 Commands ที่ใช้บ่อย

### สำหรับ Development

```bash
# รันระบบพร้อม auto-reload
npm run dev

# รัน tests
npm test

# รัน tests แบบ watch mode
npm run test:watch
```

### สำหรับ Docker

```bash
# ดู logs
docker-compose logs -f

# เข้า container
docker-compose exec web bash

# Rebuild image
docker-compose build --no-cache
```

---

## 🔗 URLs

| URL                                 | รายละเอียด      |
| ----------------------------------- | --------------- |
| http://localhost:3000               | Home page       |
| http://localhost:3000/login         | Login page      |
| http://localhost:3000/dashboard     | Dashboard       |
| http://localhost:3000/api/books     | API - Books     |
| http://localhost:3000/api/members   | API - Members   |
| http://localhost:3000/api/borrowing | API - Borrowing |

---

## 💡 ทีป

1. **สำหรับ API testing:** ใช้ Postman หรือ Insomnia
2. **เปิด database:** ใช้ SQLite Browser หรือ DBeaver
3. **ดูข้อมูลตัวอย่าง:** ไปที่ `database/schema.sql`

---

## ❌ ประเด็นที่อาจเกิดปัญหา

### Port 3000 ถูกใช้งานแล้ว

```bash
# สำหรับ Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# สำหรับ Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Docker ไม่เรียงการ

```bash
docker-compose down -v
docker-compose up -d
```

### Database errors

```bash
# ลบ database และสร้างใหม่
rm database/library.db
npm start
```

---

## 📞 ต้องการความช่วยเหลือ?

- ตรวจสอบ README.md สำหรับรายละเอียดเพิ่มเติม
- ดูไฟล์ log เมื่อมีปัญหา
- ติดต่อผู้สอน

---

**เริ่มเรียนรู้ Software Testing กันเลย! 🎓**
