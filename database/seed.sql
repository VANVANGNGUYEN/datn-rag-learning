USE datn_learning;

INSERT INTO courses (course_code, title, description, status)
VALUES (
  'JS_BASIC',
  'JavaScript cơ bản',
  'Học phần dùng để xây dựng và đánh giá nguyên mẫu RAG trong đồ án.',
  'draft'
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description);

SET @course_id = (
  SELECT course_id FROM courses WHERE course_code = 'JS_BASIC' LIMIT 1
);

INSERT INTO topics (course_id, slug, title, description, sort_order) VALUES
(@course_id, 'bien-va-kieu-du-lieu', 'Biến và kiểu dữ liệu', 'Khai báo biến, phạm vi và các kiểu dữ liệu JavaScript.', 1),
(@course_id, 'cau-lenh-dieu-kien', 'Câu lệnh điều kiện', 'if, switch, truthy, falsy và toán tử điều kiện.', 2),
(@course_id, 'vong-lap', 'Vòng lặp', 'for, while, for...of, for...in và điều khiển vòng lặp.', 3),
(@course_id, 'ham', 'Hàm', 'Khai báo hàm, arrow function, callback và closure.', 4),
(@course_id, 'mang', 'Mảng', 'Các thao tác và phương thức xử lý mảng.', 5),
(@course_id, 'doi-tuong', 'Đối tượng', 'Thuộc tính, method, this, destructuring và JSON.', 6),
(@course_id, 'lop-va-huong-doi-tuong', 'Lớp và hướng đối tượng', 'class, kế thừa, static và private field.', 7),
(@course_id, 'bat-dong-bo', 'Lập trình bất đồng bộ', 'Promise, async, await và xử lý lỗi.', 8),
(@course_id, 'module', 'Module', 'import, export và tổ chức mã nguồn theo module.', 9),
(@course_id, 'dom-va-su-kien', 'DOM và sự kiện', 'Truy cập DOM, cập nhật giao diện và xử lý sự kiện.', 10)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  sort_order = VALUES(sort_order);

SELECT course_id, course_code, title, status FROM courses WHERE course_code = 'JS_BASIC';
SELECT topic_id, slug, title, sort_order FROM topics WHERE course_id = @course_id ORDER BY sort_order;
