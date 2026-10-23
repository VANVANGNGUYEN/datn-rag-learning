# Cấu hình dịch vụ embedding và LLM

## 1. Nguyên tắc

Mã nguồn không gắn chặt với một nhà cung cấp. Dịch vụ được chọn cần hỗ trợ hai API:

- `POST /embeddings`: nhận `model` và `input`, trả mảng vector trong `data`.
- `POST /chat/completions`: nhận `model` và `messages`, trả câu trả lời trong `choices`.

Đây là cách sử dụng mô hình embedding và mô hình ngôn ngữ có sẵn như phạm vi đề cương; đồ án không huấn luyện mô hình từ đầu.

## 2. Cấu hình an toàn

Sao chép `.env.example` thành `.env` rồi điền:

```text
EMBEDDING_PROVIDER=api
EMBEDDING_API_URL=https://dia-chi-dich-vu/v1
EMBEDDING_API_KEY=khong-dua-len-github
EMBEDDING_MODEL=ten-mo-hinh-embedding

LLM_API_URL=https://dia-chi-dich-vu/v1
LLM_API_KEY=khong-dua-len-github
LLM_MODEL=ten-mo-hinh-ngon-ngu
```

Khóa truy cập chỉ lưu trong `.env`. Tệp này đã được khai báo trong `.gitignore` và không được đưa lên GitHub hoặc ảnh chụp màn hình.

## 3. Kiểm tra kết nối

```powershell
npm run check:models
```

Lệnh chỉ được xem là thành công khi:

- embedding trả về một vector có số chiều lớn hơn 0;
- LLM trả về được nội dung;
- terminal in đúng tên hai model đã cấu hình.

## 4. Lập chỉ mục bằng dịch vụ embedding

```powershell
npm run index
npm run eval:retrieval -- --dataset dev
```

Sau khi chọn `chunk_size`, `overlap` và `Top-k` trên tập phát triển, giữ nguyên cấu hình rồi chạy:

```powershell
npm run eval:retrieval
```

File `data/vector-store/index.json` ghi lại provider, model và số chiều nên có thể kiểm tra chỉ mục được tạo bằng mô hình nào.

## 5. Đánh giá câu trả lời từ LLM

Chạy thử 5 câu trước để kiểm tra chi phí và định dạng:

```powershell
npm run eval:generation -- --limit 5
```

Sau khi ổn định, chạy đủ 50 câu:

```powershell
npm run eval:generation
```

Mỗi câu được gọi hai lần với cùng LLM và nhiệt độ:

1. Baseline chỉ nhận câu hỏi.
2. RAG nhận câu hỏi cùng các chunk đã truy xuất.

Kết quả tự động lưu tại `data/evaluation/generation-results.json`. Phiếu `manual-evaluation.csv` dùng để chấm thủ công ba tiêu chí đúng kiến thức, bám nguồn và đầy đủ ý, mỗi tiêu chí từ 0 đến 2.

## 6. Phạm vi của chế độ cục bộ

Vector feature hashing và câu trả lời trích xuất chỉ dùng để kiểm tra luồng xử lý cục bộ. Kết quả này không thay thế kết quả của dịch vụ embedding và LLM. Khi chưa cấu hình dịch vụ, hệ thống chỉ ghi nhận các chỉ số retrieval của chế độ cục bộ.
