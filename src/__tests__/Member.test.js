const MemberController = require('../controllers/MemberController');
const Member = require('../models/Member');
const Borrowing = require('../models/Borrowing');

// Mock Models ทั้งหมดที่เกี่ยวข้อง
jest.mock('../models/Member');
jest.mock('../models/Borrowing');

describe('Member Controller - Full Coverage Test', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  // 1. เทสต์ getAll
  test('getAll members - Success', async () => {
    Member.getAll.mockResolvedValue([{ id: 1, fullName: 'John Doe' }]);
    await MemberController.getAll(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  // 2. เทสต์ getById (กรณีเจอ / ไม่เจอ)
  test('getById - Success with borrowing records', async () => {
    req.params.id = 1;
    Member.findById.mockResolvedValue({ id: 1, fullName: 'John Doe' });
    Member.getBorrowingCount.mockResolvedValue(2);
    Borrowing.getByMember.mockResolvedValue([{ id: 101, book_title: 'Node.js Guide' }]);

    await MemberController.getById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      borrowingCount: 2,
      borrowingRecords: expect.any(Array)
    }));
  });

  test('getById - Not Found (404)', async () => {
    req.params.id = 99;
    Member.findById.mockResolvedValue(null);
    await MemberController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // 3. เทสต์ create (กรณีข้อมูลไม่ครบ / รหัสซ้ำ / สำเร็จ)
  test('create member - Fail if required fields missing (400)', async () => {
    req.body = { fullName: 'John' }; // ขาด memberCode และ memberType
    await MemberController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create member - Fail if duplicate memberCode (400)', async () => {
    req.body = { memberCode: 'M001', fullName: 'John', memberType: 'regular' };
    Member.findByCode.mockResolvedValue({ id: 1, memberCode: 'M001' }); // จำลองว่ามีรหัสนี้แล้ว
    await MemberController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('create member - Success (201)', async () => {
    req.body = { memberCode: 'M002', fullName: 'Jane', memberType: 'premium' };
    Member.findByCode.mockResolvedValue(null);
    Member.create.mockResolvedValue({ lastID: 5 });
    await MemberController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // 4. เทสต์ update (กรณีไม่เจอ / ข้อมูลไม่ครบ / สำเร็จ)
  test('update member - Success', async () => {
    req.params.id = 1;
    req.body = { fullName: 'John Updated', memberType: 'regular', status: 'active' };
    Member.findById.mockResolvedValue({ id: 1 });
    Member.update.mockResolvedValue({ changes: 1 });

    await MemberController.update(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // 5. เทสต์ delete (กรณีไม่เจอ / มีหนังสือค้างส่ง / สำเร็จ)
  test('delete member - Fail if has unreturned books (400)', async () => {
    req.params.id = 1;
    Member.findById.mockResolvedValue({ id: 1 });
    Member.getBorrowingCount.mockResolvedValue(3); // จำลองว่ามีหนังสือค้างอยู่ 3 เล่ม

    await MemberController.delete(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Cannot delete member with unreturned books"
    }));
  });

  test('delete member - Success', async () => {
    req.params.id = 1;
    Member.findById.mockResolvedValue({ id: 1 });
    Member.getBorrowingCount.mockResolvedValue(0); // ไม่มีหนังสือค้าง
    Member.delete.mockResolvedValue({ changes: 1 });

    await MemberController.delete(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // 6. เทสต์ Error Catch (500)
  test('should handle internal server errors (500)', async () => {
    Member.getAll.mockRejectedValue(new Error('DB Crash'));
    await MemberController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});