// Member model
const { getOne, getAll, run } = require("./query");

const Member = {
  async findById(memberId) {
    return getOne("SELECT * FROM members WHERE member_id = ?", [memberId]);
  },

  async findByCode(memberCode) {
    return getOne("SELECT * FROM members WHERE member_code = ?", [memberCode]);
  },

  async getAll() {
    return getAll("SELECT * FROM members ORDER BY member_code");
  },

  async getActive() {
    return getAll(
      'SELECT * FROM members WHERE status = "active" ORDER BY member_code',
    );
  },

  async create(memberCode, fullName, email, phone, memberType, maxBooks = 3) {
    const registrationDate = new Date().toISOString().split("T")[0];
    return run(
      "INSERT INTO members (member_code, full_name, email, phone, member_type, registration_date, max_books) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        memberCode,
        fullName,
        email,
        phone,
        memberType,
        registrationDate,
        maxBooks,
      ],
    );
  },

  async update(memberId, fullName, email, phone, memberType, status, maxBooks) {
    return run(
      "UPDATE members SET full_name = ?, email = ?, phone = ?, member_type = ?, status = ?, max_books = ? WHERE member_id = ?",
      [fullName, email, phone, memberType, status, maxBooks, memberId],
    );
  },

  async updateStatus(memberId, status) {
    return run("UPDATE members SET status = ? WHERE member_id = ?", [
      status,
      memberId,
    ]);
  },

  async delete(memberId) {
    return run("DELETE FROM members WHERE member_id = ?", [memberId]);
  },

  async getBorrowingCount(memberId) {
    const result = await getOne(
      'SELECT COUNT(*) as count FROM borrowing WHERE member_id = ? AND (status = "borrowed" OR status = "overdue")',
      [memberId],
    );
    return result ? result.count : 0;
  },
};

module.exports = Member;
