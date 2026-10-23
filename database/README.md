# Khởi tạo MySQL

Yêu cầu: MySQL Server 8.0 trở lên đang chạy.

## Chạy trong MySQL Command Line Client

Đăng nhập bằng `root`, sau đó chạy:

```sql
SOURCE E:/datn/database/schema.sql;
SOURCE E:/datn/database/seed.sql;
USE datn_learning;
SHOW TABLES;
```

Đường dẫn trong lệnh `SOURCE` dùng dấu `/` dù đang chạy Windows.

Kết quả mong đợi:

- Database `datn_learning` được tạo với bảng mã `utf8mb4`.
- Có 21 bảng nghiệp vụ và thực nghiệm.
- Khóa học `JS_BASIC` và 10 chủ đề được thêm.

## Tạo tài khoản cho ứng dụng

Không dùng `root` trong Node.js. Sao chép `create-app-user.sql.example` thành `create-app-user.sql`, thay mật khẩu mạnh rồi chạy file đó bằng `root`.

Tài khoản `datn_app` chỉ có quyền `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên database của đồ án; không có quyền tạo/xóa database hoặc quản lý tài khoản.

## Kiểm tra nhanh

```sql
SELECT VERSION();
SELECT COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'datn_learning';

SELECT COUNT(*) AS topic_count
FROM datn_learning.topics;
```
