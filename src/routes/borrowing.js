// Borrowing routes
const express = require("express");
const router = express.Router();
const BorrowingController = require("../controllers/BorrowingController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/borrowed", requireAuth, BorrowingController.getBorrowed);
router.get("/overdue", requireAuth, requireAdmin,BorrowingController.getOverdue);
router.get(
  "/member/:memberId",
  requireAuth,
  requireAdmin,
  BorrowingController.getMemberBorrows,
);
router.get("/", requireAuth, requireAdmin,BorrowingController.getAll);
router.post("/", requireAuth, requireAdmin,BorrowingController.borrow);
router.get("/:borrowId", requireAuth, BorrowingController.findById);
router.put("/:borrowId/return", requireAuth, requireAdmin, BorrowingController.returnBook);
router.put("/:borrowId/extend", requireAuth, BorrowingController.extendDueDate);

module.exports = router;
