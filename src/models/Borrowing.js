// Borrowing model
const { getOne, getAll, run } = require("./query");

const Borrowing = {
  async findById(borrowId) {
    return getOne(
      `SELECT b.borrow_id as id, b.*, m.full_name as member_name, bk.title as book_title 
       FROM borrowing b 
       LEFT JOIN members m ON b.member_id = m.member_id 
       LEFT JOIN books bk ON b.book_id = bk.book_id 
       WHERE b.borrow_id = ?`,
      [borrowId],
    );
  },

  async getAll() {
    return getAll(`
            SELECT b.borrow_id as id, b.*, m.full_name as member_name, bk.title as book_title 
            FROM borrowing b 
            JOIN members m ON b.member_id = m.member_id 
            JOIN books bk ON b.book_id = bk.book_id 
            ORDER BY b.borrow_date DESC
        `);
  },

  async getByMember(memberId) {
    return getAll(
      `SELECT b.borrow_id as id, b.*, m.full_name as member_name, bk.title as book_title 
             FROM borrowing b 
             JOIN members m ON b.member_id = m.member_id 
             JOIN books bk ON b.book_id = bk.book_id 
             WHERE b.member_id = ? 
             ORDER BY b.borrow_date DESC`,
      [memberId],
    );
  },

  async getBorrowed() {
    return getAll(`
            SELECT b.borrow_id as id, b.*, m.full_name as member_name, bk.title as book_title 
            FROM borrowing b 
            JOIN members m ON b.member_id = m.member_id 
            JOIN books bk ON b.book_id = bk.book_id 
            WHERE b.status IN ('borrowed', 'overdue')
            ORDER BY b.due_date ASC
        `);
  },

  async getOverdue() {
    return getAll(`
            SELECT b.borrow_id as id, b.*, m.full_name as member_name, bk.title as book_title 
            FROM borrowing b 
            JOIN members m ON b.member_id = m.member_id 
            JOIN books bk ON b.book_id = bk.book_id 
            WHERE b.status = 'overdue'
            ORDER BY b.due_date ASC
        `);
  },

  async create(memberId, bookId, borrowDate, dueDate) {
    return run(
      "INSERT INTO borrowing (member_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)",
      [memberId, bookId, borrowDate, dueDate, "borrowed"],
    );
  },

  async returnBook(borrowId, returnDate, fineAmount = 0) {
    return run(
      "UPDATE borrowing SET return_date = ?, fine_amount = ?, status = ? WHERE borrow_id = ?",
      [returnDate, fineAmount, "returned", borrowId],
    );
  },

  async updateStatus(borrowId, status) {
    return run("UPDATE borrowing SET status = ? WHERE borrow_id = ?", [
      status,
      borrowId,
    ]);
  },

  async getMemberCurrentBorrows(memberId) {
    return getAll(
      `SELECT b.borrow_id as id, b.*, bk.title as book_title 
             FROM borrowing b 
             JOIN books bk ON b.book_id = bk.book_id 
             WHERE b.member_id = ? AND (b.status = 'borrowed' OR b.status = 'overdue')`,
      [memberId],
    );
  },

  async checkIfBookBorrowed(bookId) {
    const result = await getOne(
      'SELECT COUNT(*) as count FROM borrowing WHERE book_id = ? AND (status = "borrowed" OR status = "overdue")',
      [bookId],
    );
    return result ? result.count > 0 : false;
  },
};

module.exports = Borrowing;
