# Đồ án: Hệ thống học tập trực tuyến tích hợp RAG

## Yêu cầu môi trường

- Node.js 18 trở lên.
- Chạy `npm install` để cài các thư viện Node.js cần thiết.
- API embedding và LLM là tùy chọn. Khi chưa cấu hình API, hệ thống dùng chế độ cục bộ để kiểm tra luồng xử lý.
- MySQL Server 8.0 trở lên và tài khoản `datn_app` để chạy website.

## Chạy lần đầu

```powershell
Copy-Item .env.example .env
npm run setup
npm run ask -- "Sự khác nhau giữa let và const là gì?"
npm run eval:retrieval
```

Khởi tạo MySQL sau khi đã cài MySQL Server:

```sql
SOURCE E:/datn/database/schema.sql;
SOURCE E:/datn/database/seed.sql;
```

Xem `database/README.md` để kiểm tra 21 bảng và tạo tài khoản ứng dụng có quyền giới hạn.

Chạy website sau khi đã cấu hình `.env`:

```powershell
npm install
npm run seed:demo
npm run dev
```

## Cấu trúc chính

```text
datn/
├── database/             Schema MySQL, dữ liệu khởi tạo và mẫu tài khoản ứng dụng
├── documents/            Học liệu JavaScript dùng làm nguồn RAG
├── data/
│   ├── seed/             Dữ liệu gốc để sinh bộ câu hỏi
│   ├── generated/        Dữ liệu sinh ra sau npm run generate:data
│   ├── vector-store/     Chỉ mục vector cục bộ
│   └── evaluation/       Kết quả đánh giá retrieval
├── public/               Giao diện HTML/CSS/JavaScript
├── src/
    ├── lib/              Hàm xử lý văn bản
    ├── services/         Chunking, embedding, vector store, LLM, RAG
    └── scripts/          Các lệnh chạy từ terminal
└── server.js             Điểm khởi động Express
```
