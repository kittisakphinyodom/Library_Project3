// Book controller
const Book = require("../models/Book");
const Borrowing = require("../models/Borrowing");

const BookController = {
  async getAll(req, res) {
    try {
      const books = await Book.getAll();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const book = await Book.findById(id);

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Check if book is currently borrowed
      const isBorrowed = await Borrowing.checkIfBookBorrowed(id);
      book.isBorrowed = isBorrowed;

      res.json(book);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const books = await Book.search(q);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const {
        isbn,
        title,
        author,
        publisher,
        publicationYear,
        category,
        totalCopies,
        shelfLocation,
      } = req.body;

      if (!title || !author || !totalCopies) {
        return res
          .status(400)
          .json({ error: "Title, author, and total copies are required" });
      }

      // Check for duplicate ISBN
      if (isbn) {
        const existingBook = await Book.findByIsbn(isbn);
        if (existingBook) {
          return res.status(400).json({ error: "ISBN already exists" });
        }
      }

      const result = await Book.create(
        isbn || null,
        title,
        author,
        publisher || null,
        publicationYear || null,
        category || null,
        totalCopies,
        shelfLocation || null,
      );

      res.status(201).json({
        success: true,
        book_id: result.lastID,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        isbn,
        title,
        author,
        publisher,
        publicationYear,
        category,
        totalCopies,
        shelfLocation,
      } = req.body;

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      if (!title || !author || !totalCopies) {
        return res
          .status(400)
          .json({ error: "Title, author, and total copies are required" });
      }

      await Book.update(
        id,
        isbn || null,
        title,
        author,
        publisher || null,
        publicationYear || null,
        category || null,
        totalCopies,
        shelfLocation || null,
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Check if book is borrowed
      const isBorrowed = await Borrowing.checkIfBookBorrowed(id);
      if (isBorrowed) {
        return res.status(400).json({ error: "Cannot delete a borrowed book" });
      }

      await Book.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = BookController;
