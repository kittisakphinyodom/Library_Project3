// Auth controller
const User = require("../models/User");

const AuthController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }

      const user = await User.findByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Set session
      req.session.user_id = user.user_id;
      req.session.username = user.username;
      req.session.full_name = user.full_name;
      req.session.role = user.role;

      res.json({
        success: true,
        message: "Login successful",
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true, message: "Logout successful" });
    });
  },

  async getCurrentUser(req, res) {
    if (!req.session.user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      user_id: req.session.user_id,
      username: req.session.username,
      full_name: req.session.full_name,
      role: req.session.role,
    });
  },
};

module.exports = AuthController;
