// Member controller
const Member = require("../models/Member");
const Borrowing = require("../models/Borrowing");

const MemberController = {
  async getAll(req, res) {
    try {
      const members = await Member.getAll();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findById(id);

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Get borrowing count
      const borrowCount = await Member.getBorrowingCount(id);
      member.borrowingCount = borrowCount;

      // Get current borrowing records
      const borrowRecords = await Borrowing.getByMember(id);
      member.borrowingRecords = borrowRecords;

      res.json(member);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { memberCode, fullName, email, phone, memberType, maxBooks } =
        req.body;

      if (!memberCode || !fullName || !memberType) {
        return res.status(400).json({
          error: "Member code, full name, and member type are required",
        });
      }

      // Check for duplicate member code
      const existingMember = await Member.findByCode(memberCode);
      if (existingMember) {
        return res.status(400).json({ error: "Member code already exists" });
      }

      const result = await Member.create(
        memberCode,
        fullName,
        email || null,
        phone || null,
        memberType,
        maxBooks || 3,
      );

      res.status(201).json({
        success: true,
        member_id: result.lastID,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { fullName, email, phone, memberType, status, maxBooks } = req.body;

      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      if (!fullName || !memberType || !status) {
        return res
          .status(400)
          .json({ error: "Full name, member type, and status are required" });
      }

      await Member.update(
        id,
        fullName,
        email || null,
        phone || null,
        memberType,
        status,
        maxBooks || 3,
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Check if member has unreturned books
      const borrowCount = await Member.getBorrowingCount(id);
      if (borrowCount > 0) {
        return res
          .status(400)
          .json({ error: "Cannot delete member with unreturned books" });
      }

      await Member.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = MemberController;
