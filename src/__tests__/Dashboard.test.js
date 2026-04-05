const DashboardController = require('../controllers/DashboardController');
jest.mock('../models/query'); // Mock ตัวที่ Dashboard เรียกใช้

describe('Dashboard Controller Coverage', () => {
  test('getStats should cover lines', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await DashboardController.getStats(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});