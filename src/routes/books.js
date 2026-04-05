// Book routes
const express = require("express");
const router = express.Router();
const BookController = require("../controllers/BookController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, BookController.getAll);
router.get("/search", requireAuth, BookController.search);
router.get("/:id", requireAuth, BookController.getById);
router.post("/", requireAdmin, BookController.create);
router.put("/:id", requireAdmin, BookController.update);
router.delete("/:id", requireAdmin, BookController.delete);

module.exports = router;
