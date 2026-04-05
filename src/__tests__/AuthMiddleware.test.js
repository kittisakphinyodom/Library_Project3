const { requireAuth, requireAdmin } = require('../middleware/auth');

describe('Auth Middleware - Complete Coverage', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    // จำลอง Request, Response และ Next function
    req = {
      session: {},
      originalUrl: ''
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  // --- 1. ทดสอบ requireAuth (ต้องเก็บให้ครบทุก if) ---
  describe('requireAuth function', () => {
    test('should call next if user is logged in', () => {
      req.session.user_id = 1;
      requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should return 401 if not logged in and is API call', () => {
      req.session = null; // ไม่มี session
      req.originalUrl = '/api/test'; // เป็น API
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test('should redirect to /login if not logged in and NOT API call', () => {
      req.session = {}; // ไม่มี user_id
      req.originalUrl = '/dashboard'; // ไม่ใช่ API
      requireAuth(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });

  // --- 2. ทดสอบ requireAdmin (ต้องเก็บให้ครบทั้ง 401 และ 403) ---
  describe('requireAdmin function', () => {
    test('should return 401 if no session exists', () => {
      req.session = null;
      requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should return 403 if user is not an admin', () => {
      req.session = { user_id: 1, role: 'user' }; // ไม่ใช่ admin
      requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden - Admin access required" });
    });

    test('should call next if user is admin', () => {
      req.session = { user_id: 1, role: 'admin' }; // เป็น admin
      requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});