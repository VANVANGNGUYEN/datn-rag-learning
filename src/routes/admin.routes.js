const express = require("express");
const { pool } = require("../db");
const { allowRoles, requireAuth } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../utils/http");

const router = express.Router();
router.use(requireAuth, allowRoles("admin"));

router.get("/summary", asyncHandler(async (_request, response) => {
  const [[userSummary]] = await pool.execute(
    `SELECT COUNT(*) AS totalUsers,
            SUM(role = 'student') AS studentCount,
            SUM(role = 'teacher') AS teacherCount,
            SUM(role = 'admin') AS adminCount,
            SUM(status = 'active') AS activeCount
     FROM users`
  );
  const [[contentSummary]] = await pool.execute(
    `SELECT
       (SELECT COUNT(*) FROM courses) AS courseCount,
       (SELECT COUNT(*) FROM lessons) AS lessonCount,
       (SELECT COUNT(*) FROM documents) AS documentCount,
       (SELECT COUNT(*) FROM enrollments WHERE status = 'active') AS enrollmentCount`
  );

  response.json({
    summary: {
      totalUsers: Number(userSummary.totalUsers),
      studentCount: Number(userSummary.studentCount),
      teacherCount: Number(userSummary.teacherCount),
      adminCount: Number(userSummary.adminCount),
      activeCount: Number(userSummary.activeCount),
      courseCount: Number(contentSummary.courseCount),
      lessonCount: Number(contentSummary.lessonCount),
      documentCount: Number(contentSummary.documentCount),
      enrollmentCount: Number(contentSummary.enrollmentCount)
    }
  });
}));

router.get("/users", asyncHandler(async (_request, response) => {
  const [rows] = await pool.execute(
    `SELECT user_id AS userId, email, full_name AS fullName, role, status,
            created_at AS createdAt
     FROM users
     ORDER BY FIELD(role, 'admin', 'teacher', 'student'), full_name`
  );
  response.json({ users: rows });
}));

router.patch("/users/:userId/status", asyncHandler(async (request, response) => {
  const userId = Number(request.params.userId);
  const status = String(request.body.status || "");
  if (!Number.isInteger(userId) || userId < 1) throw httpError(400, "Người dùng không hợp lệ.");
  if (!["active", "locked", "inactive"].includes(status)) {
    throw httpError(400, "Trạng thái tài khoản không hợp lệ.");
  }
  if (userId === request.user.userId) {
    throw httpError(400, "Không thể tự khóa tài khoản đang đăng nhập.");
  }

  const [result] = await pool.execute(
    "UPDATE users SET status = ? WHERE user_id = ?",
    [status, userId]
  );
  if (!result.affectedRows) throw httpError(404, "Không tìm thấy người dùng.");
  response.json({ message: "Đã cập nhật trạng thái tài khoản." });
}));

module.exports = router;
