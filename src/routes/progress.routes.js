const express = require("express");
const { pool } = require("../db");
const { allowRoles, requireAuth } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../utils/http");

const router = express.Router();
router.use(requireAuth, allowRoles("student"));

router.get("/", asyncHandler(async (request, response) => {
  const [rows] = await pool.execute(
    `SELECT c.course_id AS courseId, c.course_code AS courseCode, c.title,
            COUNT(DISTINCT l.lesson_id) AS totalLessons,
            COUNT(DISTINCT CASE WHEN lp.completed_at IS NOT NULL THEN l.lesson_id END) AS completedLessons,
            COALESCE(ROUND(AVG(COALESCE(lp.progress_percent, 0)), 1), 0) AS progressPercent,
            MAX(lp.last_accessed_at) AS lastAccessedAt
     FROM enrollments e
     JOIN courses c ON c.course_id = e.course_id
     LEFT JOIN lessons l ON l.course_id = c.course_id AND l.status = 'published'
     LEFT JOIN learning_progress lp ON lp.lesson_id = l.lesson_id AND lp.student_id = e.student_id
     WHERE e.student_id = ? AND e.status = 'active'
     GROUP BY c.course_id
     ORDER BY c.title`,
    [request.user.userId]
  );
  response.json({ progress: rows });
}));

router.put("/:lessonId", asyncHandler(async (request, response) => {
  const lessonId = Number(request.params.lessonId);
  const progressPercent = Number(request.body.progressPercent);
  if (!Number.isInteger(lessonId) || lessonId < 1) throw httpError(400, "Mã bài học không hợp lệ.");
  if (!Number.isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100) {
    throw httpError(400, "Tiến độ phải nằm trong khoảng 0 đến 100.");
  }

  const [accessRows] = await pool.execute(
    `SELECT l.lesson_id
     FROM lessons l
     JOIN enrollments e ON e.course_id = l.course_id
     WHERE l.lesson_id = ? AND e.student_id = ? AND e.status = 'active'`,
    [lessonId, request.user.userId]
  );
  if (!accessRows[0]) throw httpError(403, "Bạn chưa tham gia khóa học chứa bài học này.");

  await pool.execute(
    `INSERT INTO learning_progress
       (student_id, lesson_id, progress_percent, first_opened_at, last_accessed_at, completed_at)
     VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), IF(? = 100, UTC_TIMESTAMP(), NULL))
     ON DUPLICATE KEY UPDATE
       progress_percent = VALUES(progress_percent),
       last_accessed_at = UTC_TIMESTAMP(),
       completed_at = IF(VALUES(progress_percent) = 100, COALESCE(completed_at, UTC_TIMESTAMP()), NULL)`,
    [request.user.userId, lessonId, progressPercent, progressPercent]
  );
  response.json({ message: "Đã cập nhật tiến độ.", progressPercent });
}));

module.exports = router;
