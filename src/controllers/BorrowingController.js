// Borrowing controller
const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const Member = require("../models/Member");

const calculateFine = (dueDate, returnDate) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const daysOverdue = Math.floor((returned - due) / (1000 * 60 * 60 * 24));

  if (daysOverdue > 0) {
    return daysOverdue * 10; // 10 baht per day
  }
  return 0;
};

const BorrowingController = {
  async findById(req, res) {
    try {
      const { borrowId } = req.params;
      const record = await Borrowing.findById(borrowId);
      if (!record) {
        return res.status(404).json({ error: "Borrowing record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const records = await Borrowing.getAll();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBorrowed(req, res) {
    try {
      const records = await Borrowing.getBorrowed();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOverdue(req, res) {
    try {
      const records = await Borrowing.getOverdue();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getMemberBorrows(req, res) {
    try {
      const { memberId } = req.params;
      const records = await Borrowing.getByMember(memberId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async borrow(req, res) {
    try {
      const { memberId, bookId, borrowDate, dueDate } = req.body;

      if (!memberId || !bookId || !borrowDate || !dueDate) {
        return res.status(400).json({
          error: "Member ID, book ID, borrow date, and due date are required",
        });
      }

      // Check if member exists and is active
      const member = await Member.findById(memberId);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      if (member.status !== "active") {
        return res.status(400).json({ error: "Member is not active" });
      }

      // Check member borrowing limit
      const borrowCount = await Member.getBorrowingCount(memberId);
      if (borrowCount >= member.max_books) {
        return res.status(400).json({
          error: `Member has reached maximum borrowing limit (${member.max_books})`,
        });
      }

      // Check if book exists and is available
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      if (book.available_copies <= 0) {
        return res.status(400).json({ error: "Book is not available" });
      }

      // Check if book is already borrowed by this member
      const currentBorrows = await Borrowing.getMemberCurrentBorrows(memberId);
      if (currentBorrows.some((b) => b.book_id === bookId)) {
        return res
          .status(400)
          .json({ error: "Member already borrowed this book" });
      }

      // Create borrow record
      const result = await Borrowing.create(
        memberId,
        bookId,
        borrowDate,
        dueDate,
      );

      // Update available copies
      await Book.updateAvailableCopies(bookId, book.available_copies - 1);

      res.status(201).json({
        success: true,
        borrow_id: result.lastID,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async returnBook(req, res) {
    try {
      const { borrowId } = req.params;
      const { returnDate } = req.body;

      if (!returnDate) {
        return res.status(400).json({ error: "Return date is required" });
      }

      const borrow = await Borrowing.findById(borrowId);
      if (!borrow) {
        return res.status(404).json({ error: "Borrowing record not found" });
      }

      if (borrow.status === "returned") {
        return res.status(400).json({ error: "Book already returned" });
      }

      // Calculate fine
      const fineAmount = calculateFine(borrow.due_date, returnDate);

      // Update borrowing record
      await Borrowing.returnBook(borrowId, returnDate, fineAmount);

      // Update available copies
      const book = await Book.findById(borrow.book_id);
      if (book) {
        await Book.updateAvailableCopies(
          borrow.book_id,
          book.available_copies + 1,
        );
      }

      res.json({
        success: true,
        fineAmount: fineAmount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async extendDueDate(req, res) {
    try {
      const { borrowId } = req.params;
      const { newDueDate } = req.body;

      if (!newDueDate) {
        return res.status(400).json({ error: "New due date is required" });
      }

      const borrow = await Borrowing.findById(borrowId);
      if (!borrow) {
        return res.status(404).json({ error: "Borrowing record not found" });
      }

      if (borrow.status === "returned") {
        return res.status(400).json({ error: "Cannot extend a returned book" });
      }

      // Update due date (simple update without status change)
      const { db } = require("../database");
      const { run } = require("../models/query");
      await run("UPDATE borrowing SET due_date = ? WHERE borrow_id = ?", [
        newDueDate,
        borrowId,
      ]);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = BorrowingController;
