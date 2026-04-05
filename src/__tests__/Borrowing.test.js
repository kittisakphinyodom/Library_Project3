const BorrowingController = require('../controllers/BorrowingController');
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const Member = require('../models/Member');
const query = require('../models/query');

// Mock ทุกอย่างที่เกี่ยวข้อง
jest.mock('../models/Borrowing');
jest.mock('../models/Book');
jest.mock('../models/Member');
jest.mock('../models/query');

describe('Full Coverage Borrowing Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  // 1. ทดสอบ getAll
  test('getAll should work', async () => {
    Borrowing.getAll.mockResolvedValue([]);
    await BorrowingController.getAll(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  // 2. ทดสอบ findById (เจอ และ ไม่เจอ)
  test('findById should work (Success & Not Found)', async () => {
    req.params.borrowId = 1;
    Borrowing.findById.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null);
    
    await BorrowingController.findById(req, res); // Success
    await BorrowingController.findById(req, res); // Not Found
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // 3. ทดสอบ getBorrowed, getOverdue, getMemberBorrows
  test('get special lists should work', async () => {
    Borrowing.getBorrowed.mockResolvedValue([]);
    Borrowing.getOverdue.mockResolvedValue([]);
    await BorrowingController.getBorrowed(req, res);
    await BorrowingController.getOverdue(req, res);
    
    req.params.memberId = 1;
    await BorrowingController.getMemberBorrows(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  // 4. ทดสอบ borrow (หัวใจหลักของคะแนน)
  test('borrow should cover all branches', async () => {
    // Case 1: Missing fields
    req.body = {};
    await BorrowingController.borrow(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // Case 2: Success path
    req.body = { memberId: 1, bookId: 1, borrowDate: '2026-01-01', dueDate: '2026-01-08' };
    Member.findById.mockResolvedValue({ id: 1, status: 'active', max_books: 5 });
    Member.getBorrowingCount.mockResolvedValue(0);
    Book.findById.mockResolvedValue({ id: 1, available_copies: 5 });
    Borrowing.getMemberCurrentBorrows.mockResolvedValue([]);
    Borrowing.create.mockResolvedValue({ lastID: 100 });

    await BorrowingController.borrow(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // 5. ทดสอบ returnBook
  test('returnBook should work', async () => {
    req.params.borrowId = 1;
    req.body = { returnDate: '2026-01-10' };
    
    Borrowing.findById.mockResolvedValue({ 
      id: 1, due_date: '2026-01-01', status: 'borrowed', book_id: 1 
    });
    Book.findById.mockResolvedValue({ id: 1, available_copies: 5 });
    
    await BorrowingController.returnBook(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  // 6. ทดสอบ extendDueDate
  test('extendDueDate should work', async () => {
    req.params.borrowId = 1;
    req.body = { newDueDate: '2026-02-01' };
    
    Borrowing.findById.mockResolvedValue({ id: 1, status: 'borrowed' });
    query.run.mockResolvedValue({ changes: 1 });
    
    await BorrowingController.extendDueDate(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // 7. ทดสอบ Error Catch (เพื่อเก็บคะแนนส่วน Catch block)
  test('catch blocks should work', async () => {
    Borrowing.getAll.mockRejectedValue(new Error('DB Error'));
    await BorrowingController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});