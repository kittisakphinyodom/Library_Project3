const { initializeDatabase, db } = require('../database');
const Book = require('../models/Book');

describe('Book Model - 100% Coverage Test', () => {
  
  // 1. เตรียม Database
  beforeAll(async () => {
    await initializeDatabase();
  });

  // 2. ปิด Database เมื่อจบ
  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  test('Should cover all Book functions', async () => {
    // --- Test: create ---
    const newBook = await Book.create(
      'ISBN-999', 'Mastering Node.js', 'John Doe', 
      'IT Press', 2026, 'Technology', 10, 'Shelf-A1'
    );
    const bookId = newBook.lastID;
    expect(bookId).toBeDefined();

    // --- Test: findById ---
    const book = await Book.findById(bookId);
    expect(book.isbn).toBe('ISBN-999');

    // --- Test: findByIsbn ---
    const bookByIsbn = await Book.findByIsbn('ISBN-999');
    expect(bookByIsbn.id).toBe(bookId);

    // --- Test: getAll ---
    const allBooks = await Book.getAll();
    expect(allBooks.length).toBeGreaterThan(0);

    // --- Test: search ---
    const searchResult = await Book.search('Mastering');
    expect(searchResult[0].title).toContain('Mastering');

    // --- Test: update ---
    await Book.update(
      bookId, 'ISBN-999-EDIT', 'Updated Title', 'New Author',
      'New Pub', 2027, 'Education', 20, 'Shelf-B2'
    );
    const updatedBook = await Book.findById(bookId);
    expect(updatedBook.title).toBe('Updated Title');

    // --- Test: updateAvailableCopies (จุดที่มักจะแดง) ---
    await Book.updateAvailableCopies(bookId, 15);
    const copiesCheck = await Book.findById(bookId);
    expect(copiesCheck.available_copies).toBe(15);

    // --- Test: getAvailableBooks ---
    const availableBooks = await Book.getAvailableBooks();
    expect(Array.isArray(availableBooks)).toBe(true);

    // --- Test: getCategories (จุดเก็บแต้ม) ---
    const categories = await Book.getCategories();
    expect(categories).toContain('Education');

    // --- Test: delete ---
    await Book.delete(bookId);
    const deletedBook = await Book.findById(bookId);
    expect(deletedBook).toBeUndefined();
  });
});