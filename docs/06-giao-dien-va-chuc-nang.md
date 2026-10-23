# Tuần 6 — Giao diện, đăng nhập, phân quyền và nội dung học tập

## 1. Phạm vi đã triển khai

Giao diện được xây bằng HTML5, CSS3 và JavaScript thuần. Backend dùng Node.js, Express.js và MySQL.

| Chức năng | Học viên | Giảng viên | Quản trị viên |
|---|---:|---:|---:|
| Đăng nhập, làm mới token, đăng xuất | Có | Có | Có |
| Xem khóa học, bài học, tài liệu | Có | Có | Có |
| Cập nhật và xem tiến độ | Có | Không | Không |
| Hỏi đáp RAG có nguồn | Có | Có | Có |
| Tạo khóa học | Không | Có | Có |
| Thêm bài học và tài liệu | Không | Có | Có |
| Xem toàn bộ tài khoản và khóa học | Không | Không | Có |
| Khóa/mở trạng thái tài khoản | Không | Không | Có |

Mỗi vai trò có không gian riêng:

- Học viên tập trung vào khóa đã ghi danh, tiến độ và hỏi đáp RAG.
- Giảng viên chỉ thấy khóa được phân công, số học viên và công cụ soạn nội dung.
- Quản trị viên xem số liệu toàn hệ thống, danh sách tài khoản và toàn bộ khóa học.

## 2. Luồng xác thực

1. Người dùng gửi email và mật khẩu tới `POST /api/auth/login`.
2. Backend so sánh mật khẩu với chuỗi băm bcrypt trong MySQL.
3. Access token có thời hạn ngắn được trả về cho JavaScript.
4. Refresh token ngẫu nhiên được lưu trong cookie `HttpOnly`; MySQL chỉ lưu SHA-256 của token.
5. Khi làm mới, refresh token cũ bị thu hồi và token mới được tạo theo cơ chế rotation.
6. Middleware kiểm tra access token và vai trò trước khi xử lý API.

Ứng dụng không lưu access token vào `localStorage`. Khi tải lại trang, trình duyệt dùng cookie `HttpOnly` để xin access token mới.

## 3. Các màn hình

- Đăng nhập và lựa chọn tài khoản demo.
- Tổng quan theo vai trò.
- Danh sách và chi tiết khóa học.
- Danh sách bài học, tài liệu và tiến độ.
- Trang tiến độ dành cho học viên.
- Trang hỏi đáp RAG và nguồn tham chiếu.
- Trang tạo khóa học, bài học và tài liệu cho giảng viên/quản trị viên.
- Trang quản lý tài khoản dành riêng cho quản trị viên.

Giao diện responsive, có menu thu gọn trên điện thoại và không phụ thuộc thư viện giao diện ngoài.

## 4. Chuẩn bị tài khoản MySQL cho Node.js

Đăng nhập MySQL bằng `root`, thay mật khẩu ví dụ bằng mật khẩu riêng rồi chạy:

```sql
CREATE USER IF NOT EXISTS 'datn_app'@'localhost'
  IDENTIFIED BY 'MAT_KHAU_RIENG_CUA_BAN';
GRANT SELECT, INSERT, UPDATE, DELETE
  ON datn_learning.* TO 'datn_app'@'localhost';
FLUSH PRIVILEGES;
```

Sao chép `.env.example` thành `.env`, điền `DB_PASSWORD` và thay `JWT_ACCESS_SECRET` bằng chuỗi ngẫu nhiên dài ít nhất 32 ký tự. Không đưa `.env` lên GitHub.

## 5. Tạo dữ liệu demo và chạy

```powershell
cd E:\datn
npm install
npm run seed:demo
npm run dev
```

Mở `http://127.0.0.1:3000`.

Tài khoản demo cục bộ:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Học viên | `hocvien@datn.local` | `Student@12345` |
| Giảng viên | `giangvien@datn.local` | `Teacher@12345` |
| Quản trị viên | `admin@datn.local` | `Admin@12345` |

Các tài khoản này chỉ dùng trên máy phát triển. Khi triển khai thật phải xóa hoặc đổi mật khẩu.

## 6. API chính

| Phương thức | Đường dẫn | Mục đích |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Rotation refresh token |
| POST | `/api/auth/logout` | Thu hồi refresh token |
| GET/POST | `/api/courses` | Danh sách/tạo khóa học |
| GET/POST | `/api/courses/:id/lessons` | Xem/thêm bài học |
| GET/POST | `/api/courses/:id/documents` | Xem/thêm tài liệu |
| GET | `/api/progress` | Tổng hợp tiến độ |
| PUT | `/api/progress/:lessonId` | Cập nhật tiến độ |
| POST | `/api/rag/ask` | Hỏi đáp theo học liệu |
| GET | `/api/admin/summary` | Số liệu tổng quan hệ thống |
| GET | `/api/admin/users` | Danh sách tài khoản |
| PATCH | `/api/admin/users/:id/status` | Khóa hoặc mở tài khoản |

## 7. Chức năng chưa triển khai

- Tài liệu mới được khai báo metadata, chưa có chức năng tải file lên server.
- Chưa có chức năng sửa/xóa nội dung và giao diện ngân hàng câu hỏi.
- Chưa có công thức đánh giá mức độ nắm vững theo chủ đề.
- Tài khoản mẫu chỉ dùng trong môi trường phát triển cục bộ.
