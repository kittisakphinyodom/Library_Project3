# API Documentation - Library Management System v2

REST API documentation สำหรับระบบจัดการห้องสมุด

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

ทุก endpoint (ยกเว้น `/auth/login`) ต้องการ authenticated session

### Login

**Endpoint:** `POST /auth/login`

**Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 1,
    "username": "admin",
    "full_name": "System Administrator",
    "role": "admin"
  }
}
```

---

## Dashboard API

### Get System Statistics

**Endpoint:** `GET /dashboard/stats`

**Authentication:** Required

**Response (200):**

```json
{
  "totalBooks": 8,
  "availableBooks": 5,
  "activeMembers": 5,
  "borrowedBooks": 3,
  "overdueBooks": 1,
  "unreturned": 2
}
```

---

## Books API

### List All Books

**Endpoint:** `GET /books`

**Authentication:** Required

**Response (200):**

```json
[
  {
    "id": 1,
    "isbn": "978-616-123-456-7",
    "title": "การเขียนโปรแกรม Python",
    "author": "สมศักดิ์ โค้ดดี",
    "publisher": "สำนักพิมพ์ไอที",
    "publication_year": 2023,
    "category": "Computer",
    "total_copies": 3,
    "available_copies": 3,
    "shelf_location": "A-101",
    "status": "available",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

### Get Book Details

**Endpoint:** `GET /books/:id`

**Authentication:** Required

**Parameters:**

- `id` (integer, path) - Book ID

**Response (200):**

```json
{
  "id": 1,
  "isbn": "978-616-123-456-7",
  "title": "การเขียนโปรแกรม Python",
  "author": "สมศักดิ์ โค้ดดี",
  "publisher": "สำนักพิมพ์ไอที",
  "publication_year": 2023,
  "category": "Computer",
  "total_copies": 3,
  "available_copies": 3,
  "shelf_location": "A-101",
  "status": "available",
  "isBorrowed": false,
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

**Response (404):**

```json
{
  "error": "Book not found"
}
```

### Search Books

**Endpoint:** `GET /books/search?q=query`

**Authentication:** Required

**Query Parameters:**

- `q` (string, required) - Search query (title, author, ISBN)

**Response (200):**

```json
[
  {
    "id": 1,
    "title": "การเขียนโปรแกรม Python",
    "author": "สมศักดิ์ โค้ดดี"
    // ... other fields
  }
]
```

### Create Book

**Endpoint:** `POST /books`

**Authentication:** Required (Admin only)

**Body:**

```json
{
  "isbn": "978-616-123-456-9",
  "title": "หนังสือใหม่",
  "author": "ผู้เขียน",
  "publisher": "สำนักพิมพ์",
  "publicationYear": 2024,
  "category": "Computer",
  "totalCopies": 2,
  "shelfLocation": "A-106"
}
```

**Response (201):**

```json
{
  "success": true,
  "id": 9
}
```

**Response (400):**

```json
{
  "error": "Title, author, and total copies are required"
}
```

### Update Book

**Endpoint:** `PUT /books/:id`

**Authentication:** Required (Admin only)

**Body:**

```json
{
  "isbn": "978-616-123-456-9",
  "title": "หนังสือแก้ไข",
  "author": "ผู้เขียน",
  "publisher": "สำนักพิมพ์",
  "publicationYear": 2024,
  "category": "Computer",
  "totalCopies": 2,
  "shelfLocation": "A-106"
}
```

**Response (200):**

```json
{
  "success": true
}
```

### Delete Book

**Endpoint:** `DELETE /books/:id`

**Authentication:** Required (Admin only)

**Response (200):**

```json
{
  "success": true
}
```

**Response (400):**

```json
{
  "error": "Cannot delete a borrowed book"
}
```

---

## Members API

### List All Members

**Endpoint:** `GET /members`

**Authentication:** Required

**Response (200):**

```json
[
  {
    "member_id": 1,
    "member_code": "M001",
    "full_name": "สมชาย ใจดี",
    "email": "somchai@email.com",
    "phone": "081-234-5678",
    "member_type": "student",
    "registration_date": "2024-01-15",
    "status": "active",
    "max_books": 3,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

### Get Member Details

**Endpoint:** `GET /members/:id`

**Authentication:** Required

**Response (200):**

```json
{
  "member_id": 1,
  "member_code": "M001",
  "full_name": "สมชาย ใจดี",
  "email": "somchai@email.com",
  "phone": "081-234-5678",
  "member_type": "student",
  "registration_date": "2024-01-15",
  "status": "active",
  "max_books": 3,
  "borrowingCount": 1,
  "borrowingRecords": [
    {
      "borrow_id": 1,
      "book_id": 5,
      "title": "การทดสอบซอฟต์แวร์",
      "borrow_date": "2024-10-01",
      "due_date": "2024-10-15",
      "return_date": null,
      "fine_amount": 0,
      "status": "overdue"
    }
  ],
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

### Create Member

**Endpoint:** `POST /members`

**Authentication:** Required (Admin only)

**Body:**

```json
{
  "memberCode": "M006",
  "fullName": "สมาชิกใหม่",
  "email": "newmember@email.com",
  "phone": "089-xxx-xxxx",
  "memberType": "student",
  "maxBooks": 3
}
```

**Response (201):**

```json
{
  "success": true,
  "member_id": 6
}
```

### Update Member

**Endpoint:** `PUT /members/:id`

**Authentication:** Required (Admin only)

**Body:**

```json
{
  "fullName": "สมาชิกแก้ไข",
  "email": "updated@email.com",
  "phone": "089-xxx-xxxx",
  "memberType": "student",
  "status": "active",
  "maxBooks": 4
}
```

**Response (200):**

```json
{
  "success": true
}
```

### Delete Member

**Endpoint:** `DELETE /members/:id`

**Authentication:** Required (Admin only)

**Response (200):**

```json
{
  "success": true
}
```

**Response (400):**

```json
{
  "error": "Cannot delete member with unreturned books"
}
```

---

## Borrowing API

### List All Borrowing Records

**Endpoint:** `GET /borrowing`

**Authentication:** Required

**Response (200):**

```json
[
  {
    "id": 1,
    "member_id": 1,
    "book_id": 5,
    "member_name": "สมชาย ใจดี",
    "book_title": "การทดสอบซอฟต์แวร์",
    "borrow_date": "2024-10-01",
    "due_date": "2024-10-15",
    "return_date": null,
    "fine_amount": 0,
    "status": "overdue",
    "created_at": "2024-10-01T10:00:00.000Z"
  }
]
```

### Get Currently Borrowed Books

**Endpoint:** `GET /borrowing/borrowed`

**Authentication:** Required

**Response (200):**

```json
[
  {
    "id": 1,
    "member_id": 1,
    "book_id": 5,
    "member_name": "สมชาย ใจดี",
    "book_title": "การทดสอบซอฟต์แวร์",
    "borrow_date": "2024-10-01",
    "due_date": "2024-10-15",
    "status": "borrowed"
  }
]
```

### Get Overdue Books

**Endpoint:** `GET /borrowing/overdue`

**Authentication:** Required

**Response (200):**

```json
[
  {
    "id": 1,
    "member_id": 1,
    "book_id": 5,
    "member_name": "สมชาย ใจดี",
    "book_title": "การทดสอบซอฟต์แวร์",
    "due_date": "2024-10-15",
    "status": "overdue"
  }
]
```

### Get Member's Borrowing History

**Endpoint:** `GET /borrowing/member/:memberId`

**Authentication:** Required

**Response (200):**

```json
[
  {
    "id": 1,
    "member_id": 1,
    "book_id": 5,
    "book_title": "การทดสอบซอฟต์แวร์",
    "borrow_date": "2024-10-01",
    "due_date": "2024-10-15",
    "return_date": null,
    "status": "overdue"
  }
]
```

### Get Borrowing Details

**Endpoint:** `GET /borrowing/:borrowId`

**Authentication:** Required

**Response (200):**

```json
{
  "id": 1,
  "member_id": 1,
  "book_id": 5,
  "member_name": "สมชาย ใจดี",
  "book_title": "การทดสอบซอฟต์แวร์",
  "borrow_date": "2024-10-01",
  "due_date": "2024-10-15",
  "return_date": null,
  "fine_amount": 0,
  "status": "overdue",
  "created_at": "2024-10-01T10:00:00.000Z"
}
```

**Response (404):**

```json
{
  "error": "Borrowing record not found"
}
```

### Borrow Book

**Endpoint:** `POST /borrowing`

**Authentication:** Required

**Body:**

```json
{
  "memberId": 1,
  "bookId": 1,
  "borrowDate": "2024-12-10",
  "dueDate": "2024-12-24"
}
```

**Response (201):**

```json
{
  "success": true,
  "id": 10
}
```

**Response (400):**

```json
{
  "error": "Member has reached maximum borrowing limit (3)"
}
```

### Return Book

**Endpoint:** `PUT /borrowing/:borrowId/return`

**Authentication:** Required

**Body:**

```json
{
  "returnDate": "2024-12-25"
}
```

**Response (200):**

```json
{
  "success": true,
  "fineAmount": 10
}
```

### Extend Due Date

**Endpoint:** `PUT /borrowing/:borrowId/extend`

**Authentication:** Required

**Body:**

```json
{
  "newDueDate": "2024-12-31"
}
```

**Response (200):**

```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Description of what went wrong"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden - Admin access required"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Testing with cURL

### Example: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Example: Get Books

```bash
curl -X GET http://localhost:3000/api/books \
  -b "connect.sid=<session_id>"
```

### Example: Create Book

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -b "connect.sid=<session_id>" \
  -d '{
    "title":"New Book",
    "author":"Author",
    "totalCopies":2
  }'
```

---

## Testing with Postman

1. สร้าง collection ใหม่
2. สร้าง environment variable:
   - `base_url`: http://localhost:3000
   - `session_id`: <session_id_from_login>
3. สร้าง requests ตามตัวอย่างข้างต้น

---
