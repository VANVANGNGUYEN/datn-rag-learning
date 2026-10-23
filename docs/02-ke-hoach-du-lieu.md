# Tuần 2 — Chuẩn hóa tài liệu và xây dựng bộ dữ liệu

## 1. Danh sách chủ đề

1. Biến và kiểu dữ liệu.
2. Câu lệnh điều kiện.
3. Vòng lặp.
4. Hàm.
5. Mảng.
6. Đối tượng.
7. Lớp và hướng đối tượng.
8. Lập trình bất đồng bộ.
9. Module.
10. DOM và sự kiện.

Thông tin chính thức nằm trong `data/generated/topics.json`.

## 2. Quy tắc chuẩn hóa học liệu

- Mỗi tài liệu chỉ phụ trách một chủ đề.
- Tiêu đề dùng Markdown để bộ chia chunk nhận biết mục hiện tại.
- Ví dụ mã ngắn, chạy được và chỉ minh họa một ý chính.
- Thuật ngữ tiếng Anh được giữ lại khi đó là tên chuẩn của JavaScript.
- Mỗi chunk khi lập chỉ mục phải có `topic_id`, `source`, `heading` và `chunk_index`.

## 3. Ngân hàng câu hỏi

Mỗi câu có các trường:

| Trường | Ý nghĩa |
|---|---|
| `question_id` | Mã duy nhất |
| `topic` | Chủ đề |
| `difficulty` | `easy`, `medium` hoặc `hard` |
| `question_text` | Nội dung câu hỏi |
| `options` | Bốn lựa chọn |
| `correct_answer` | Đáp án chuẩn |
| `source` | Tài liệu làm căn cứ |
| `explanation` | Giải thích ngắn |

Lệnh sinh dữ liệu:

```powershell
npm run generate:data
```

Lệnh kiểm tra số lượng, mã trùng và đường dẫn nguồn:

```powershell
npm run validate:data
```

## 4. Tập phát triển và bộ test

- `rag-dev.json`: 20 câu, chỉ dùng thử tham số.
- `rag-test.json`: 50 câu, chỉ chạy sau khi đã chốt cấu hình.
- Hai tập có mã câu hỏi riêng và không trùng câu chữ.
- Mỗi bản ghi có `test_id`, `topic`, `question`, `gold_answer`, `gold_source`.

## 5. Phân mức độ khó

- **Easy:** nhớ khái niệm hoặc nhận biết cú pháp.
- **Medium:** áp dụng một khái niệm vào đoạn mã ngắn.
- **Hard:** phân tích kết quả, tìm lỗi hoặc kết hợp nhiều ý.

Hiện tại đây là bộ dữ liệu mẫu phục vụ quá trình phát triển. Nội dung cần được rà soát lại trước khi sử dụng cho khảo sát thực tế.
