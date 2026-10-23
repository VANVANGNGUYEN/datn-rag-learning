const { httpError } = require("./http");

async function requireCourseAccess(connection, user, courseId, options = {}) {
  const numericCourseId = Number(courseId);
  if (!Number.isInteger(numericCourseId) || numericCourseId < 1) {
    throw httpError(400, "Mã khóa học không hợp lệ.");
  }

  let sql = "SELECT course_id, instructor_id FROM courses WHERE course_id = ?";
  const parameters = [numericCourseId];

  if (user.role === "student") {
    sql = `SELECT c.course_id, c.instructor_id
           FROM courses c
           JOIN enrollments e ON e.course_id = c.course_id
           WHERE c.course_id = ? AND e.student_id = ? AND e.status = 'active'`;
    parameters.push(user.userId);
  } else if (user.role === "teacher") {
    sql += " AND instructor_id = ?";
    parameters.push(user.userId);
  }

  const [rows] = await connection.execute(sql, parameters);
  if (!rows[0]) throw httpError(403, "Bạn không có quyền truy cập khóa học này.");
  if (options.manage && user.role === "student") {
    throw httpError(403, "Học viên không có quyền quản lý khóa học.");
  }
  return rows[0];
}

module.exports = { requireCourseAccess };
