/**
 * Example test file for Authentication
 */

const request = require("supertest");
const app = require("../app");

describe("Authentication API", () => {
  describe("POST /api/auth/login", () => {
    test("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("user_id");
      expect(response.body.user).toHaveProperty("username", "admin");
      expect(response.body.user).toHaveProperty("role");
    });

    test("should fail with invalid password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    test("should fail with non-existent username", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "password",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 when fields are missing", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        // Missing password
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    test("should logout successfully", async () => {
      // First login
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      const cookies = loginResponse.headers["set-cookie"];

      // Then logout
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies[0]);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty("success", true);
    });
  });

  describe("GET /api/auth/me", () => {
    test("should get current user info when authenticated", async () => {
      // First login
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "librarian",
        password: "lib123",
      });

      const cookies = loginResponse.headers["set-cookie"];

      // Get user info
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies[0]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user_id");
      expect(response.body).toHaveProperty("username", "librarian");
      expect(response.body).toHaveProperty("role", "librarian");
    });

    test("should return 401 when not authenticated", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
    });
  });
});
