const BookController = require('../controllers/BookController');
const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');

jest.mock('../models/Book');
jest.mock('../models/Borrowing');

describe('BookController - Deep Coverage', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, query: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  // 1. getAll & search
  test('getAll and search should work', async () => {
    Book.getAll.mockResolvedValue([]);
    await BookController.getAll(req, res);
    expect(res.json).toHaveBeenCalled();

    // Test Search - No Query (400)
    req.query.q = '';
    await BookController.search(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // Test Search - Success
    req.query.q = 'test';
    Book.search.mockResolvedValue([]);
    await BookController.search(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  // 2. getById (Success & Not Found)
  test('getById coverage', async () => {
    req.params.id = 1;
    Book.findById.mockResolvedValueOnce(null);
    await BookController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    Book.findById.mockResolvedValueOnce({ id: 1 });
    Borrowing.checkIfBookBorrowed.mockResolvedValue(true);
    await BookController.getById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ isBorrowed: true }));
  });

  // 3. create (ดักข้อมูลไม่ครบ & ISBN ซ้ำ)
  test('create coverage - validation & duplicate', async () => {
    // ข้อมูลไม่ครบ (400)
    req.body = { title: '' }; 
    await BookController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // ISBN ซ้ำ (400)
    req.body = { isbn: '123', title: 'T', author: 'A', totalCopies: 5 };
    Book.findByIsbn.mockResolvedValue({ id: 10 });
    await BookController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // สำเร็จ (201)
    Book.findByIsbn.mockResolvedValue(null);
    Book.create.mockResolvedValue({ lastID: 20 });
    await BookController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // 4. update (ดัก Not Found & ข้อมูลไม่ครบ)
  test('update coverage', async () => {
    req.params.id = 1;
    // ไม่เจอหนังสือ (404)
    Book.findById.mockResolvedValueOnce(null);
    await BookController.update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    // ข้อมูลส่งมาไม่ครบ (400)
    Book.findById.mockResolvedValueOnce({ id: 1 });
    req.body = { title: '' }; 
    await BookController.update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // สำเร็จ
    Book.findById.mockResolvedValueOnce({ id: 1 });
    req.body = { title: 'T', author: 'A', totalCopies: 5 };
    Book.update.mockResolvedValue({ changes: 1 });
    await BookController.update(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // 5. delete (ดัก Not Found & ถูกยืมอยู่)
  test('delete coverage', async () => {
    req.params.id = 1;
    // ไม่เจอ (404)
    Book.findById.mockResolvedValueOnce(null);
    await BookController.delete(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

    // ถูกยืมอยู่ ลบไม่ได้ (400)
    Book.findById.mockResolvedValueOnce({ id: 1 });
    Borrowing.checkIfBookBorrowed.mockResolvedValue(true);
    await BookController.delete(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // สำเร็จ
    Book.findById.mockResolvedValueOnce({ id: 1 });
    Borrowing.checkIfBookBorrowed.mockResolvedValue(false);
    Book.delete.mockResolvedValue({ changes: 1 });
    await BookController.delete(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // 6. Catch Error (500)
  test('error 500 coverage', async () => {
    Book.getAll.mockRejectedValue(new Error('Crash'));
    await BookController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});