// Book model
const { getOne, getAll, run } = require("./query");

const Book = {
  async findById(bookId) {
    return getOne("SELECT book_id as id, * FROM books WHERE book_id = ?", [
      bookId,
    ]);
  },

  async findByIsbn(isbn) {
    return getOne("SELECT * FROM books WHERE isbn = ?", [isbn]);
  },

  async getAll() {
    return getAll("SELECT book_id as id, * FROM books ORDER BY title");
  },

  async search(query) {
    const searchTerm = `%${query}%`;
    return getAll(
      "SELECT book_id as id, * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? ORDER BY title",
      [searchTerm, searchTerm, searchTerm],
    );
  },

  async create(
    isbn,
    title,
    author,
    publisher,
    publicationYear,
    category,
    totalCopies,
    shelfLocation,
  ) {
    return run(
      "INSERT INTO books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies, shelf_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        isbn,
        title,
        author,
        publisher,
        publicationYear,
        category,
        totalCopies,
        totalCopies,
        shelfLocation,
      ],
    );
  },

  async update(
    bookId,
    isbn,
    title,
    author,
    publisher,
    publicationYear,
    category,
    totalCopies,
    shelfLocation,
  ) {
    return run(
      "UPDATE books SET isbn = ?, title = ?, author = ?, publisher = ?, publication_year = ?, category = ?, total_copies = ?, shelf_location = ? WHERE book_id = ?",
      [
        isbn,
        title,
        author,
        publisher,
        publicationYear,
        category,
        totalCopies,
        shelfLocation,
        bookId,
      ],
    );
  },

  async updateAvailableCopies(bookId, availableCopies) {
    return run("UPDATE books SET available_copies = ? WHERE book_id = ?", [
      availableCopies,
      bookId,
    ]);
  },

  async delete(bookId) {
    return run("DELETE FROM books WHERE book_id = ?", [bookId]);
  },

  async getAvailableBooks() {
    return getAll(
      "SELECT book_id as id, * FROM books WHERE available_copies > 0 ORDER BY title",
    );
  },

  async getCategories() {
    const result = await getAll(
      "SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category",
    );
    return result.map((r) => r.category);
  },
};

module.exports = Book;
