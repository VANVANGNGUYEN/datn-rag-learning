const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const knowledge = require("../../data/seed/topic-knowledge");

const demoUsers = [
  { email: "admin@datn.local", fullName: "Quản trị viên Demo", role: "admin", password: "Admin@12345" },
  { email: "giangvien@datn.local", fullName: "Giảng viên Demo", role: "teacher", password: "Teacher@12345" },
  { email: "hocvien@datn.local", fullName: "Học viên Demo", role: "student", password: "Student@12345" }
];

async function upsertUser(connection, user) {
  const passwordHash = await bcrypt.hash(user.password, 12);
  await connection.execute(
    `INSERT INTO users (email, password_hash, full_name, role, status)
     VALUES (?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       full_name = VALUES(full_name),
       role = VALUES(role),
       status = 'active'`,
    [user.email, passwordHash, user.fullName, user.role]
  );
  const [rows] = await connection.execute(
    "SELECT user_id FROM users WHERE email = ? LIMIT 1",
    [user.email]
  );
  return rows[0].user_id;
}

async function main() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userIds = {};
    for (const user of demoUsers) {
      userIds[user.role] = await upsertUser(connection, user);
    }

    const [courseRows] = await connection.execute(
      "SELECT course_id FROM courses WHERE course_code = 'JS_BASIC' LIMIT 1"
    );
    if (!courseRows[0]) {
      throw new Error("Chưa có khóa học JS_BASIC. Hãy chạy database/seed.sql trước.");
    }
    const courseId = courseRows[0].course_id;
    await connection.execute(
      "UPDATE courses SET instructor_id = ?, status = 'published' WHERE course_id = ?",
      [userIds.teacher, courseId]
    );
    await connection.execute(
      `INSERT INTO enrollments (course_id, student_id, status)
       VALUES (?, ?, 'active')
       ON DUPLICATE KEY UPDATE status = 'active'`,
      [courseId, userIds.student]
    );

    const [topicRows] = await connection.execute(
      "SELECT topic_id, slug, title, sort_order FROM topics WHERE course_id = ? ORDER BY sort_order",
      [courseId]
    );
    const topicBySlug = new Map(topicRows.map(topic => [topic.slug, topic]));

    for (const topic of knowledge) {
      const databaseTopic = topicBySlug.get(topic.id);
      if (!databaseTopic) throw new Error(`Thiếu topic trong MySQL: ${topic.id}`);
      const lessonSlug = `bai-${String(databaseTopic.sort_order).padStart(2, "0")}-${topic.id}`;
      const summary = `Bài học ${databaseTopic.sort_order}: ${topic.title}. Nội dung chi tiết được lấy từ học liệu ${topic.source}.`;
      await connection.execute(
        `INSERT INTO lessons (course_id, topic_id, slug, title, content, sort_order, status)
         VALUES (?, ?, ?, ?, ?, ?, 'published')
         ON DUPLICATE KEY UPDATE
           topic_id = VALUES(topic_id), title = VALUES(title), content = VALUES(content),
           sort_order = VALUES(sort_order), status = 'published'`,
        [courseId, databaseTopic.topic_id, lessonSlug, topic.title, summary, databaseTopic.sort_order]
      );
      const [lessonRows] = await connection.execute(
        "SELECT lesson_id FROM lessons WHERE course_id = ? AND slug = ? LIMIT 1",
        [courseId, lessonSlug]
      );
      const lessonId = lessonRows[0].lesson_id;

      const [documentRows] = await connection.execute(
        "SELECT document_id FROM documents WHERE course_id = ? AND source_path = ? LIMIT 1",
        [courseId, topic.source]
      );
      if (!documentRows[0]) {
        await connection.execute(
          `INSERT INTO documents
             (course_id, lesson_id, topic_id, uploaded_by, title, file_name, source_path, file_type, indexing_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'text', 'indexed')`,
          [
            courseId,
            lessonId,
            databaseTopic.topic_id,
            userIds.teacher,
            `Tài liệu ${topic.title}`,
            topic.source.split("/").pop(),
            topic.source
          ]
        );
      }
    }

    const [lessonRows] = await connection.execute(
      "SELECT lesson_id, sort_order FROM lessons WHERE course_id = ? ORDER BY sort_order LIMIT 3",
      [courseId]
    );
    const sampleProgress = [100, 65, 25];
    for (const [index, lesson] of lessonRows.entries()) {
      const percent = sampleProgress[index];
      await connection.execute(
        `INSERT INTO learning_progress
           (student_id, lesson_id, progress_percent, first_opened_at, last_accessed_at, completed_at)
         VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), IF(? = 100, UTC_TIMESTAMP(), NULL))
         ON DUPLICATE KEY UPDATE
           progress_percent = VALUES(progress_percent),
           last_accessed_at = UTC_TIMESTAMP(),
           completed_at = VALUES(completed_at)`,
        [userIds.student, lesson.lesson_id, percent, percent]
      );
    }

    await connection.commit();
    console.log("Đã tạo dữ liệu demo Tuần 6.");
    console.log("- admin@datn.local / Admin@12345");
    console.log("- giangvien@datn.local / Teacher@12345");
    console.log("- hocvien@datn.local / Student@12345");
    console.log("Chỉ dùng các tài khoản này khi demo cục bộ.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch(error => {
  console.error(`Tạo dữ liệu demo thất bại: ${error.message}`);
  process.exitCode = 1;
});
