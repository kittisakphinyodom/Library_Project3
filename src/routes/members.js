// Member routes
const express = require("express");
const router = express.Router();
const MemberController = require("../controllers/MemberController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, MemberController.getAll);
router.get("/:id", requireAuth, MemberController.getById);
router.post("/", requireAdmin, MemberController.create);
router.put("/:id", requireAdmin, MemberController.update);
router.delete("/:id", requireAdmin, MemberController.delete);

module.exports = router;
