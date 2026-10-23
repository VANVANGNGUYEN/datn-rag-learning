# Tuần 5 — Truy xuất Top-k, tạo context và hỏi đáp

## 1. Chạy thử

```powershell
npm run ask -- "Sự khác nhau giữa let và const là gì?"
npm run ask -- "Promise dùng để làm gì?" --topic bat-dong-bo
```

Chương trình in ra:

- chế độ trả lời (`llm-api` hoặc `extractive-fallback`);
- câu trả lời;
- độ tương đồng của từng chunk;
- đường dẫn nguồn và tiêu đề mục.

## 2. Tạo context

Ba chunk có điểm cao nhất được ghép theo mẫu:

```text
[Nguồn 1: documents/... | Mục: ...]
Nội dung chunk
```

Prompt yêu cầu mô hình chỉ dùng context. Nếu context không đủ, mô hình phải nói chưa đủ dữ liệu. Danh sách nguồn do backend lấy từ metadata, không yêu cầu LLM tự tạo.

## 3. Đánh giá retrieval

```powershell
npm run eval:retrieval
```

Với mỗi câu trong bộ test, hệ thống kiểm tra `gold_source` có xuất hiện trong Top-k hay không. Chỉ số chính:

```text
Hit@k = số câu có nguồn đúng trong Top-k / tổng số câu
```

Chi tiết lưu tại `data/evaluation/retrieval-results.json` để phân tích câu sai.

## 4. Cách thử tham số đúng quy trình

1. Chỉ dùng `rag-dev.json` để thử các giá trị chunk và Top-k.
2. Ghi lại từng cấu hình và Hit@k.
3. Chọn một cấu hình trước khi đánh giá chính thức.
4. Chạy đúng một cấu hình đã chốt trên `rag-test.json`.
5. Không sửa tham số dựa trên kết quả của bộ test.

Kết quả chọn số chiều cho vector cục bộ trên tập phát triển 20 câu, giữ nguyên `chunk_size=700`, `overlap=120` và `Top-k=3`:

| Số chiều | Hit@3 trên tập phát triển |
|---:|---:|
| 512 | 65% |
| 2.048 | 85% |
| 4.096 | 95% |

Vì vậy cấu hình cục bộ được chốt ở 4.096 chiều trước khi chạy bộ test chính thức. Khi chuyển sang mô hình embedding có sẵn, số chiều do mô hình quyết định và cần đánh giá lại trên tập phát triển.

## 5. Phần chưa đánh giá ở Tuần 5

Hit@k chỉ đo bước tìm nguồn, chưa kết luận câu trả lời của LLM là đúng. Ở giai đoạn thực nghiệm đầy đủ cần đánh giá thêm: độ đúng so với đáp án chuẩn, mức bám nguồn, thông tin ngoài nguồn và thời gian phản hồi.

Mã thực nghiệm LLM thật đã được chuẩn bị bằng lệnh `npm run eval:generation`. Lệnh này không chấp nhận embedding cục bộ và sẽ dừng nếu thiếu cấu hình API, nhờ đó tránh đưa kết quả mô phỏng vào báo cáo như kết quả mô hình thật.

## 6. Kịch bản demo ngắn

1. Giới thiệu một tài liệu trong `documents`.
2. Chạy `npm run index`, giải thích chunk, embedding và metadata.
3. Hỏi một câu không lọc topic, xem ba nguồn được lấy.
4. Hỏi lại với `--topic` để minh họa giới hạn phạm vi.
5. Chạy đánh giá retrieval và mở file kết quả của một câu.
