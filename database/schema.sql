-- Library Management System - SQLite Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'librarian')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    member_type TEXT NOT NULL CHECK(member_type IN ('student', 'teacher', 'public')),
    registration_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    max_books INTEGER DEFAULT 3,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
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

-- Borrowing records table
CREATE TABLE IF NOT EXISTS borrowing (
    borrow_id INTEGER PRIMARY KEY AUTOINCREMENT,
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_code ON members(member_code);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_borrowing_member ON borrowing(member_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_book ON borrowing(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_status ON borrowing(status);

-- Insert sample users (passwords are plain for educational purposes - should be hashed in production)
INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES 
('admin', 'admin123', 'System Administrator', 'admin'),
('librarian', 'lib123', 'Library Staff', 'librarian');

-- Insert sample members
INSERT OR IGNORE INTO members (member_code, full_name, email, phone, member_type, registration_date, max_books) VALUES
('M001', 'สมชาย ใจดี', 'somchai@email.com', '081-234-5678', 'student', '2024-01-15', 3),
('M002', 'สมหญิง รักหนังสือ', 'somying@email.com', '082-345-6789', 'student', '2024-01-20', 3),
('M003', 'ดร.วิชัย อาจารย์', 'wichai@email.com', '083-456-7890', 'teacher', '2024-02-01', 5),
('M004', 'นางสาวมะลิ ทั่วไป', 'mali@email.com', '084-567-8901', 'public', '2024-02-10', 2),
('M005', 'นายทดสอบ บั๊กเกอร์', 'test@email.com', '085-678-9012', 'student', '2024-03-01', 3);

-- Insert sample books
INSERT OR IGNORE INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, shelf_location) VALUES
('978-616-123-456-7', 'การเขียนโปรแกรม Python', 'สมศักดิ์ โค้ดดี', 'สำนักพิมพ์ไอที', 2023, 'Computer', 3, 3, 'A-101'),
('978-616-123-456-8', 'โครงสร้างข้อมูล', 'วิชัย อัลกอริทึม', 'สำนักพิมพ์ไอที', 2022, 'Computer', 2, 2, 'A-102'),
('978-616-234-567-8', 'วิศวกรรมซอฟต์แวร์', 'ดร.พัฒนา ซอฟต์แวร์', 'สำนักพิมพ์เทคโนโลยี', 2023, 'Computer', 2, 2, 'A-103'),
('978-616-345-678-9', 'ฐานข้อมูล MySQL', 'สุดาศิริ ดาต้าเบส', 'สำนักพิมพ์ไอที', 2023, 'Computer', 3, 3, 'A-104'),
('978-616-456-789-0', 'การทดสอบซอฟต์แวร์', 'ทดสอบ หาบั๊ก', 'สำนักพิมพ์คุณภาพ', 2024, 'Computer', 2, 1, 'A-105'),
('978-616-567-890-1', 'Harry Potter ฉบับภาษาไทย', 'J.K. Rowling', 'Nanmeebooks', 2020, 'Fiction', 5, 5, 'B-201'),
('978-616-678-901-2', 'เศรษฐศาสตร์พอเพียง', 'ดร.เศรษฐกิจ พอใจ', 'สำนักพิมพ์มหาวิทยาลัย', 2023, 'Economics', 2, 2, 'C-301'),
('978-616-789-012-3', 'ประวัติศาสตร์ไทย', 'ศาสตราจารย์ประวัติ รู้ลึก', 'สำนักพิมพ์ประวัติศาสตร์', 2022, 'History', 3, 3, 'D-401');

-- Insert sample borrowing records (some overdue)
INSERT OR IGNORE INTO borrowing (member_id, book_id, borrow_date, due_date, status) VALUES
(1, 5, '2024-10-01', '2024-10-15', 'overdue'),
(2, 1, '2024-10-20', '2024-11-03', 'borrowed'),
(3, 3, '2024-10-25', '2024-11-08', 'borrowed');

-- Insert returned book records
INSERT OR IGNORE INTO borrowing (member_id, book_id, borrow_date, due_date, return_date, fine_amount, status) VALUES
(1, 2, '2024-09-01', '2024-09-15', '2024-09-14', 0.00, 'returned'),
(2, 4, '2024-09-10', '2024-09-24', '2024-09-26', 10.00, 'returned');
