# Tuần 1 — Khảo sát yêu cầu và chốt phạm vi

## 1. Bài toán

Người học có nhiều tài liệu nhưng khó tìm đúng phần cần ôn. Điểm tổng của bài kiểm tra cũng chưa cho biết chủ đề nào còn yếu. Đồ án xây dựng một hệ thống học tập trực tuyến có RAG để trả lời theo học liệu, hiển thị nguồn và dùng kết quả làm bài để đề xuất nội dung ôn tập.

Trong Tuần 1-5, phạm vi chỉ gồm chuẩn bị dữ liệu và làm nguyên mẫu RAG. Website đầy đủ được triển khai từ Tuần 6.

## 2. Người sử dụng

- **Học viên:** đọc bài, đặt câu hỏi, làm bài kiểm tra, xem kết quả và gợi ý ôn tập.
- **Giảng viên:** quản lý học liệu, câu hỏi, bài kiểm tra và xem kết quả của học viên.
- **Quản trị viên:** quản lý tài khoản, vai trò và dữ liệu chung.

## 3. Chức năng toàn hệ thống

### 3.1. Chức năng học tập

1. Đăng ký, đăng nhập và phân quyền.
2. Quản lý khóa học, chương, bài học và tài liệu.
3. Quản lý ngân hàng câu hỏi và bài kiểm tra.
4. Làm bài, chấm điểm và lưu lịch sử theo chủ đề.
5. Theo dõi tiến độ học.

### 3.2. Chức năng RAG

1. Đọc và chuẩn hóa tài liệu văn bản.
2. Chia tài liệu thành các chunk có chồng lấn.
3. Tạo embedding và lưu cùng metadata nguồn.
4. Truy xuất Top-k chunk theo câu hỏi và phạm vi khóa học/chủ đề.
5. Tạo context, yêu cầu LLM chỉ trả lời từ context.
6. Trả câu trả lời kèm danh sách nguồn.
7. Lưu log để đánh giá retrieval và câu trả lời.

### 3.3. Đánh giá kiến thức và gợi ý ôn tập

Phần này sẽ triển khai từ Tuần 8. Dữ liệu câu hỏi ngay từ Tuần 2 đã có `topic`, `difficulty`, `correct_answer`, `source` và `explanation` để sử dụng về sau.

## 4. Yêu cầu phi chức năng

- Giao diện dễ dùng và hiển thị tốt trên máy tính, điện thoại.
- Backend kiểm tra dữ liệu đầu vào và quyền truy cập.
- Mật khẩu không lưu dạng văn bản thuần.
- Mỗi câu trả lời RAG phải có nguồn hoặc báo không đủ tài liệu.
- Các tham số thực nghiệm phải ghi trong cấu hình và cố định trước khi chạy bộ test.
- Mã nguồn chia thành các mô-đun nhỏ, tên biến thể hiện đúng chức năng và các bước xử lý chính có thể kiểm tra độc lập.

## 5. Phạm vi dữ liệu đã chốt

- Một học phần JavaScript cơ bản.
- 10 chủ đề.
- 120 câu hỏi trong ngân hàng, mỗi chủ đề 12 câu.
- 20 câu tập phát triển để thử `chunk_size`, `overlap`, `Top-k`.
- 50 câu bộ test cố định, mỗi chủ đề 5 câu.
- Học liệu dạng Markdown; PDF sẽ bổ sung sau khi chức năng tải tài liệu được xây dựng.

## 6. Ngoài phạm vi hiện tại

- Huấn luyện mô hình ngôn ngữ hoặc mô hình embedding từ đầu.
- LMS thương mại có thanh toán, livestream, chấm bài tự luận tự động.
- Kiến trúc microservice, Kubernetes hoặc các kỹ thuật vận hành doanh nghiệp.
- Dùng bộ test chính thức để điều chỉnh tham số.

## 7. Tiêu chí hoàn thành Tuần 1

- Xác định đúng ba vai trò người dùng.
- Chốt chức năng chính và những nội dung không làm.
- Chốt học phần, số chủ đề và quy mô dữ liệu.
- Thống nhất RAG phải giới hạn nguồn và trả trích dẫn.
