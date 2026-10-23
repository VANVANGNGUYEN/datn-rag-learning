# Đồ án: Hệ thống học tập trực tuyến tích hợp RAG

Thư mục này là kết quả triển khai **Tuần 1 đến Tuần 6** của đề cương. Tuần 1-5 tập trung vào dữ liệu và pipeline RAG; Tuần 6 bổ sung website, đăng nhập/phân quyền, khóa học, bài học, tài liệu và tiến độ.

## Kết quả đã có

| Tuần | Nội dung | Sản phẩm |
|---|---|---|
| 1 | Khảo sát và chốt phạm vi | `docs/01-yeu-cau-va-pham-vi.md` |
| 2 | Chuẩn hóa dữ liệu | 10 tài liệu JavaScript, 120 câu hỏi, tập phát triển 20 câu, bộ test RAG 50 câu |
| 3 | Thiết kế hệ thống và pipeline | `docs/03-thiet-ke-he-thong.md`, cấu hình môi trường |
| 4 | Chia chunk, embedding, lưu vector | Mã trong `src/services`, lệnh `npm run index` |
| 5 | Truy xuất Top-k, tạo context, gọi LLM, trả nguồn | Lệnh `npm run ask`, `npm run eval:retrieval` |
| 6 | Giao diện và chức năng học tập cơ bản | HTML/CSS/JavaScript, Express, MySQL, JWT và bcrypt |

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

Mở `http://127.0.0.1:3000`. Xem `docs/06-giao-dien-va-chuc-nang.md` để biết tài khoản demo và ma trận phân quyền.

Có thể giới hạn truy xuất theo chủ đề:

```powershell
npm run ask -- "Promise dùng để làm gì?" --topic bat-dong-bo
```

## Cấu trúc chính

```text
datn/
├── docs/                 Tài liệu phân tích, thiết kế và kết quả Tuần 1-6
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

## Giới hạn kỹ thuật hiện tại

Chế độ embedding cục bộ dùng feature hashing với vector 4.096 chiều. Cấu hình này đạt Hit@3 tốt hơn cấu hình 512 và 2.048 chiều trên tập phát triển. Feature hashing được dùng để kiểm tra pipeline trên máy cục bộ và không phải mô hình embedding đã huấn luyện. Khi có dịch vụ embedding, đặt `EMBEDDING_PROVIDER=api` rồi tạo lại chỉ mục.

Quy trình truy xuất và kết quả đánh giá được ghi tại `docs/05-truy-xuat-va-thuc-nghiem.md`.

Hướng dẫn cấu hình dịch vụ embedding và LLM nằm trong `docs/04a-cau-hinh-embedding-va-llm.md`. Hai lệnh kiểm tra là `npm run check:models` và `npm run eval:generation`.
