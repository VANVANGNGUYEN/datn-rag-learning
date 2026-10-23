# DOM và sự kiện trong JavaScript

## DOM là gì

Document Object Model biểu diễn tài liệu HTML thành cây đối tượng để JavaScript có thể đọc và thay đổi. `document` là điểm bắt đầu để tìm phần tử.

`querySelector` trả phần tử đầu tiên khớp CSS selector hoặc `null`. `querySelectorAll` trả một NodeList gồm tất cả phần tử khớp.

```js
const title = document.querySelector("#course-title");
const lessonItems = document.querySelectorAll(".lesson-item");
```

Cần xử lý trường hợp `querySelector` trả `null`, đặc biệt khi script được dùng trên nhiều trang.

## Thay đổi nội dung an toàn

`textContent` đọc hoặc gán văn bản thuần. `innerHTML` phân tích chuỗi thành HTML; nếu chuỗi chứa dữ liệu người dùng không được làm sạch thì có nguy cơ chèn mã độc. Khi chỉ hiển thị văn bản, nên dùng `textContent`.

## Tạo và thêm phần tử

`document.createElement` tạo phần tử mới. Có thể gán nội dung, class rồi thêm bằng `append` hoặc `appendChild`.

```js
const item = document.createElement("li");
item.classList.add("lesson-item");
item.textContent = "Bài 1: Biến";
document.querySelector("#lesson-list")?.append(item);
```

## Lắng nghe sự kiện

`addEventListener` đăng ký hàm xử lý mà không ghi đè các listener khác. Đối tượng event chứa thông tin về sự kiện. `event.target` là phần tử phát sinh sự kiện, còn `event.currentTarget` là phần tử đang chạy listener.

```js
button.addEventListener("click", event => {
  console.log(event.currentTarget.textContent);
});
```

`removeEventListener` chỉ gỡ được listener khi truyền đúng tham chiếu hàm đã đăng ký.

## Hành vi mặc định và lan truyền sự kiện

`preventDefault()` ngăn hành vi mặc định như gửi form hoặc mở liên kết. `stopPropagation()` ngăn sự kiện tiếp tục lan truyền; chỉ nên dùng khi thật sự cần vì có thể làm phần khác khó nhận sự kiện.

Sự kiện thường nổi bọt từ phần tử con lên cha. Event delegation tận dụng điều này bằng cách đặt một listener ở phần tử cha và dùng `target.closest()` để tìm phần tử con cần xử lý. Nó phù hợp với danh sách có phần tử thêm động.

## classList và dataset

`classList.add`, `remove`, `toggle` và `contains` thay đổi class mà không xử lý cả chuỗi. Thuộc tính HTML `data-*` được đọc qua `element.dataset`; ví dụ `data-course-id="12"` thành `element.dataset.courseId`.

## Form

Sự kiện `submit` nên được lắng nghe trên form thay vì chỉ bắt click của nút, vì người dùng có thể nhấn Enter. Sau `preventDefault`, có thể dùng `FormData` để đọc giá trị. Dữ liệu vẫn phải được kiểm tra lại ở backend.

## Thời điểm chạy script

Script dùng thuộc tính `defer` sẽ chạy sau khi HTML được phân tích. Với script không dùng `defer`, có thể đợi sự kiện `DOMContentLoaded`. Đặt script đúng thời điểm tránh việc tìm phần tử trước khi nó tồn tại.

## Nguyên tắc cho giao diện đồ án

- Tách hàm lấy dữ liệu, hàm xử lý và hàm render.
- Không ghép dữ liệu người dùng trực tiếp vào `innerHTML`.
- Hiển thị trạng thái đang tải, lỗi và không có dữ liệu.
- Dùng nhãn form và điều khiển bằng bàn phím để giao diện dễ sử dụng.
