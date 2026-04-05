// User model
const { getOne, getAll, run } = require("./query");

const User = {
  async findByUsername(username) {
    return getOne("SELECT * FROM users WHERE username = ?", [username]);
  },

  async findById(userId) {
    return getOne("SELECT * FROM users WHERE user_id = ?", [userId]);
  },

  async getAll() {
    return getAll(
      "SELECT user_id, username, full_name, role, created_at FROM users",
    );
  },

  async create(username, password, fullName, role) {
    return run(
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
      [username, password, fullName, role],
    );
  },

  async update(userId, username, fullName, role) {
    return run(
      "UPDATE users SET username = ?, full_name = ?, role = ? WHERE user_id = ?",
      [username, fullName, role, userId],
    );
  },

  async delete(userId) {
    return run("DELETE FROM users WHERE user_id = ?", [userId]);
  },
};

module.exports = User;
