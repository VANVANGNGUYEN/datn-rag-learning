# Tuần 4 — Xử lý tài liệu, chia chunk và lập chỉ mục

## 1. Các bước đã cài đặt

1. Đọc 10 tài liệu Markdown theo danh sách chủ đề.
2. Chuẩn hóa khoảng trắng nhưng giữ tiêu đề và nội dung mã.
3. Tách theo đoạn, ưu tiên không cắt giữa một đoạn ngắn.
4. Tạo phần chồng lấn giữa hai chunk liên tiếp.
5. Gắn metadata nguồn cho từng chunk.
6. Tạo vector bằng provider đã cấu hình.
7. Lưu chỉ mục tại `data/vector-store/index.json`.

## 2. Chạy lập chỉ mục

```powershell
npm run generate:data
npm run index
```

Kết quả terminal cho biết số tài liệu, số chunk, loại embedding và vị trí file chỉ mục.

## 3. Hai chế độ embedding

### Chế độ `local`

- Chạy ngay, không cần Internet hoặc khóa API.
- Biểu diễn từ và cặp từ bằng vector băm 4.096 chiều rồi chuẩn hóa. Số chiều này được chọn sau khi thử trên tập phát triển.
- Phù hợp để kiểm tra quá trình chia chunk, tạo vector và truy xuất nguồn.
- Hạn chế: hiểu ngữ nghĩa kém hơn mô hình embedding đã huấn luyện.

### Chế độ `api`

Khai báo trong `.env`:

```text
EMBEDDING_PROVIDER=api
EMBEDDING_API_URL=https://dia-chi-dich-vu/v1
EMBEDDING_API_KEY=...
EMBEDDING_MODEL=...
```

Sau khi đổi provider phải chạy lại `npm run index`, vì vector câu hỏi và vector tài liệu phải do cùng một mô hình tạo ra.

## 4. Kiểm tra thủ công

- Mở `data/vector-store/index.json` và xem `metadata` của một chunk.
- Kiểm tra `source` có đúng tài liệu không.
- Kiểm tra hai chunk liên tiếp có phần nội dung chồng lấn.
- Không chỉnh sửa vector bằng tay.
