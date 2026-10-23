const express = require("express");
const { pool } = require("../db");
const { allowRoles, requireAuth } = require("../middleware/auth");
const { requireCourseAccess } = require("../utils/course-access");
const { asyncHandler, httpError } = require("../utils/http");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (request, response) => {
  const parameters = [];
  let accessJoin = "";
  let accessWhere = "";

  if (request.user.role === "student") {
    accessJoin = "JOIN enrollments e ON e.course_id = c.course_id AND e.student_id = ? AND e.status = 'active'";
    parameters.push(request.user.userId);
  } else if (request.user.role === "teacher") {
    accessWhere = "WHERE c.instructor_id = ?";
    parameters.push(request.user.userId);
  }

  const [rows] = await pool.execute(
    `SELECT c.course_id AS courseId, c.course_code AS courseCode, c.title,
            c.description, c.status, u.full_name AS instructorName,
            COUNT(DISTINCT l.lesson_id) AS lessonCount,
            COUNT(DISTINCT d.document_id) AS documentCount,
            COUNT(DISTINCT ce.enrollment_id) AS enrollmentCount
     FROM courses c
     ${accessJoin}
     LEFT JOIN users u ON u.user_id = c.instructor_id
     LEFT JOIN lessons l ON l.course_id = c.course_id
     LEFT JOIN documents d ON d.course_id = c.course_id
     LEFT JOIN enrollments ce ON ce.course_id = c.course_id AND ce.status = 'active'
     ${accessWhere}
     GROUP BY c.course_id
     ORDER BY c.created_at DESC`,
    parameters
  );
  response.json({ courses: rows });
}));

router.post("/", allowRoles("teacher", "admin"), asyncHandler(async (request, response) => {
  const courseCode = String(request.body.courseCode || "").trim().toUpperCase();
  const title = String(request.body.title || "").trim();
  const description = String(request.body.description || "").trim();
  if (!/^[A-Z0-9_-]{2,40}$/.test(courseCode)) {
    throw httpError(400, "Mã khóa học chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.");
  }
  if (title.length < 3 || title.length > 180) {
    throw httpError(400, "Tên khóa học phải từ 3 đến 180 ký tự.");
  }

  const instructorId = request.user.role === "teacher"
    ? request.user.userId
    : (Number(request.body.instructorId) || null);
  const [result] = await pool.execute(
    `INSERT INTO courses (instructor_id, course_code, title, description, status)
     VALUES (?, ?, ?, ?, 'draft')`,
    [instructorId, courseCode, title, description || null]
  );
  response.status(201).json({ courseId: result.insertId, message: "Đã tạo khóa học." });
}));

router.get("/:courseId", asyncHandler(async (request, response) => {
  await requireCourseAccess(pool, request.user, request.params.courseId);
  const [rows] = await pool.execute(
    `SELECT c.course_id AS courseId, c.course_code AS courseCode, c.title,
            c.description, c.status, u.full_name AS instructorName
     FROM courses c
     LEFT JOIN users u ON u.user_id = c.instructor_id
     WHERE c.course_id = ? LIMIT 1`,
    [request.params.courseId]
  );
  response.json({ course: rows[0] });
}));

router.get("/:courseId/topics", asyncHandler(async (request, response) => {
  await requireCourseAccess(pool, request.user, request.params.courseId);
  const [rows] = await pool.execute(
    `SELECT topic_id AS topicId, slug, title, description, sort_order AS sortOrder
     FROM topics WHERE course_id = ? ORDER BY sort_order`,
    [request.params.courseId]
  );
  response.json({ topics: rows });
}));

router.get("/:courseId/lessons", asyncHandler(async (request, response) => {
  await requireCourseAccess(pool, request.user, request.params.courseId);
  const studentId = request.user.role === "student" ? request.user.userId : 0;
  const [rows] = await pool.execute(
    `SELECT l.lesson_id AS lessonId, l.title, l.slug, l.content, l.status,
            l.sort_order AS sortOrder, t.topic_id AS topicId, t.title AS topicTitle,
            COALESCE(lp.progress_percent, 0) AS progressPercent,
            lp.completed_at AS completedAt
     FROM lessons l
     LEFT JOIN topics t ON t.topic_id = l.topic_id
     LEFT JOIN learning_progress lp ON lp.lesson_id = l.lesson_id AND lp.student_id = ?
     WHERE l.course_id = ?
     ORDER BY l.sort_order`,
    [studentId, request.params.courseId]
  );
  response.json({ lessons: rows });
}));

router.post("/:courseId/lessons", allowRoles("teacher", "admin"), asyncHandler(async (request, response) => {
  await requireCourseAccess(pool, request.user, request.params.courseId, { manage: true });
  const title = String(request.body.title || "").trim();
  const slug = String(request.body.slug || "").trim().toLowerCase();
  const content = String(request.body.content || "").trim();
  const topicId = Number(request.body.topicId) || null;
  if (title.length < 3 || !/^[a-z0-9-]{2,120}$/.test(slug)) {
    throw httpError(400, "Tên bài học hoặc slug không hợp lệ.");
  }

  const [orderRows] = await pool.execute(
    "SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM lessons WHERE course_id = ?",
    [request.params.courseId]
  );
  const [result] = await pool.execute(
    `INSERT INTO lessons (course_id, topic_id, slug, title, content, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
    [request.params.courseId, topicId, slug, title, content || null, orderRows[0].nextOrder]
  );
  response.status(201).json({ lessonId: result.insertId, message: "Đã tạo bài học." });
}));

router.get("/:courseId/documents", asyncHandler(async (request, response) => {
  await requireCourseAccess(pool, request.user, request.params.courseId);
  const [rows] = await pool.execute(
    `SELECT d.document_id AS documentId, d.title, d.file_name AS fileName,
            d.source_path AS sourcePath, d.file_type AS fileType,
            d.indexing_status AS indexingStatus, t.title AS topicTitle,
            l.title AS lessonTitle, d.created_at AS createdAt
     FROM documents d
     LEFT JOIN topics t ON t.topic_id = d.topic_id
     LEFT JOIN lessons l ON l.lesson_id = d.lesson_id
     WHERE d.course_id = ? ORDER BY d.created_at DESC`,
    [request.params.courseId]
  );
  response.json({ documents: rows });
}));

router.post("/:courseId/documents", allowRoles("teacher", "admin"), asyncHandler(async (request, response) => {
  await requireCourseAccess(pool, request.user, request.params.courseId, { manage: true });
  const title = String(request.body.title || "").trim();
  const fileName = String(request.body.fileName || "").trim();
  const sourcePath = String(request.body.sourcePath || "").trim();
  const fileType = request.body.fileType === "pdf" ? "pdf" : "text";
  if (!title || !fileName || !sourcePath) {
    throw httpError(400, "Tên tài liệu, tên file và đường dẫn nguồn là bắt buộc.");
  }

  const [result] = await pool.execute(
    `INSERT INTO documents
       (course_id, lesson_id, topic_id, uploaded_by, title, file_name, source_path, file_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.params.courseId,
      Number(request.body.lessonId) || null,
      Number(request.body.topicId) || null,
      request.user.userId,
      title,
      fileName,
      sourcePath,
      fileType
    ]
  );
  response.status(201).json({ documentId: result.insertId, message: "Đã thêm tài liệu." });
}));

module.exports = router;
