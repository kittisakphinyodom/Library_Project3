// Dashboard controller
//const { db } = require("../database");
const { getOne } = require("../models/query");

const DashboardController = {
  async getStats(req, res) {
    try {
      const stats = {};

      // Total books
      const totalBooks = await getOne("SELECT COUNT(*) as total FROM books");
      stats.totalBooks = totalBooks ? totalBooks.total : 0;

      // Available books
      const availableBooks = await getOne(
        "SELECT SUM(available_copies) as total FROM books",
      );
      stats.availableBooks = availableBooks ? availableBooks.total : 0;

      // Total active members
      const activeMembers = await getOne(
        'SELECT COUNT(*) as total FROM members WHERE status = "active"',
      );
      stats.activeMembers = activeMembers ? activeMembers.total : 0;

      // Currently borrowed
      const borrowedBooks = await getOne(
        'SELECT COUNT(*) as total FROM borrowing WHERE status IN ("borrowed", "overdue")',
      );
      stats.borrowedBooks = borrowedBooks ? borrowedBooks.total : 0;

      // Overdue books
      const overdueBooks = await getOne(
        'SELECT COUNT(*) as total FROM borrowing WHERE status = "overdue"',
      );
      stats.overdueBooks = overdueBooks ? overdueBooks.total : 0;

      // Unreturned books that are overdue
      const unreturned = await getOne(`
                SELECT COUNT(*) as total FROM borrowing 
                WHERE status IN ('borrowed', 'overdue') 
                AND due_date < date('now')
            `);
      stats.unreturned = unreturned ? unreturned.total : 0;

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = DashboardController;
