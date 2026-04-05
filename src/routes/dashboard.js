// Dashboard routes
const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");
const { requireAuth } = require("../middleware/auth");

router.get("/stats", requireAuth, DashboardController.getStats);

module.exports = router;
