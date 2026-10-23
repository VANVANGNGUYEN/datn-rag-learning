# Tuần 3 — Thiết kế hệ thống và pipeline RAG

## 1. Kiến trúc dự kiến

```text
Người dùng
    |
Frontend HTML/CSS/JavaScript
    |
Backend Node.js/Express
    |---------------- MySQL: tài khoản, khóa học, bài học, câu hỏi, kết quả
    |
Mô-đun RAG
    |---------------- Vector store: chunk + embedding + metadata
    |---------------- Dịch vụ embedding
    |---------------- Dịch vụ LLM
```

Tuần 1-5 mới làm mô-đun RAG dưới dạng chương trình dòng lệnh. Việc tách thành service giúp tái sử dụng trong REST API ở các tuần sau.

## 2. Hai luồng chính

### 2.1. Luồng lập chỉ mục

```text
Tài liệu -> chuẩn hóa -> chia chunk -> tạo embedding -> lưu vector + metadata
```

### 2.2. Luồng hỏi đáp

```text
Câu hỏi -> embedding câu hỏi -> lọc topic -> tính độ tương đồng
-> lấy Top-k chunk -> tạo context -> LLM -> câu trả lời + nguồn
```

## 3. Metadata của chunk

```json
{
  "id": "bien-va-kieu-du-lieu-0001",
  "topicId": "bien-va-kieu-du-lieu",
  "topicTitle": "Biến và kiểu dữ liệu",
  "source": "documents/01-bien-va-kieu-du-lieu.md",
  "heading": "let và const",
  "chunkIndex": 1
}
```

Metadata giúp giới hạn truy xuất theo chủ đề và hiển thị nguồn mà không phải đoán nguồn từ câu trả lời.

## 4. Cấu hình thực nghiệm ban đầu

| Tham số | Giá trị | Lý do |
|---|---:|---|
| `CHUNK_SIZE` | 700 ký tự | Đủ chứa một ý và ví dụ ngắn |
| `CHUNK_OVERLAP` | 120 ký tự | Giảm mất ý ở ranh giới chunk |
| `TOP_K` | 3 | Context ngắn, dễ kiểm tra nguồn |
| `MIN_SIMILARITY` | 0.08 | Ngưỡng ban đầu cho vector cục bộ |

Các giá trị này được thử trên `rag-dev.json`. Sau khi chọn xong phải giữ nguyên khi chạy `rag-test.json`.

## 5. Lựa chọn kỹ thuật phù hợp đồ án

- Node.js 18 và JavaScript CommonJS để dễ học, dễ chạy.
- Không dùng framework cho phần RAG ban đầu để nhìn rõ từng bước.
- Vector store cục bộ lưu JSON trong Tuần 4-5; về sau có thể thay bằng vector store chính thức đã chọn mà không đổi luồng xử lý.
- Embedding cục bộ dùng feature hashing để demo không tốn phí; có adapter gọi API embedding khi cấu hình khóa.
- LLM có mô-đun gọi dịch vụ; khi chưa cấu hình, chế độ trích xuất tạo câu trả lời từ các câu liên quan nhất để kiểm tra luồng.

## 6. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| Truy xuất sai chủ đề | Lưu `topicId`, cho phép lọc trước khi xếp hạng |
| Không có nguồn phù hợp | Dùng ngưỡng tương đồng và trả thông báo thiếu dữ liệu |
| LLM bịa thông tin | Prompt chỉ cho dùng context, luôn trả danh sách nguồn |
| Lộ khóa API | Để khóa trong `.env`, không commit |
| Tinh chỉnh trên bộ test | Tách rõ tập phát triển và bộ test |
