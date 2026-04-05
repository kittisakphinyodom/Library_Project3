/**
 * Example test file for Books functionality
 *
 * To run tests:
 * - npm test
 * - npm run test:watch
 * - npm test -- src/__tests__/Books.test.js
 */

const request = require("supertest");
const app = require("../app");

describe("Books API", () => {
  let sessionCookie;

  // Setup: Login before each test suite
  beforeAll(async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    // Extract session cookie
    const cookies = response.headers["set-cookie"];
    sessionCookie = cookies ? cookies[0].split(";")[0] : "";
  });

  describe("GET /api/books", () => {
    test("should get all books", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test("should return book with correct fields", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      const book = response.body[0];
      expect(book).toHaveProperty("book_id");
      expect(book).toHaveProperty("title");
      expect(book).toHaveProperty("author");
      expect(book).toHaveProperty("available_copies");
    });
  });

  describe("GET /api/books/search", () => {
    test("should search books by title", async () => {
      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "Python" })
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("should return 400 when query is empty", async () => {
      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "" })
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/books/:id", () => {
    test("should get book details by ID", async () => {
      const response = await request(app)
        .get("/api/books/1")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("book_id", 1);
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("isBorrowed");
    });

    test("should return 404 for non-existent book", async () => {
      const response = await request(app)
        .get("/api/books/99999")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/books", () => {
    test("should create a new book (Admin only)", async () => {
      const newBook = {
        title: "Test Book",
        author: "Test Author",
        isbn: "TEST-ISBN-001",
        totalCopies: 2,
        category: "Testing",
      };

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", sessionCookie)
        .send(newBook);

      expect([201, 400]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body).toHaveProperty("book_id");
      }
    });

    test("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Cookie", sessionCookie)
        .send({
          title: "Test Book",
          // Missing author and totalCopies
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Authentication", () => {
    test("should return 401 when not authenticated", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(401);
    });
  });
});
