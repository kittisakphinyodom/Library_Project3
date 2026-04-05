// Auth routes
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { requireAuth } = require("../middleware/auth");

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", requireAuth, AuthController.getCurrentUser);

module.exports = router;
