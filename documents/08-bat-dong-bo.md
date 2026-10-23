# Lập trình bất đồng bộ trong JavaScript

## Đồng bộ, bất đồng bộ và event loop

Mã đồng bộ chạy lần lượt và một tác vụ dài có thể chặn các công việc sau. Các thao tác như gọi API, hẹn giờ hoặc đọc dữ liệu thường hoàn thành sau. JavaScript dùng event loop để đưa callback sẵn sàng vào hàng đợi và chạy khi call stack trống.

`setTimeout(callback, 0)` không chạy callback ngay lập tức; nó chỉ lên lịch để callback có thể chạy sau phần mã đồng bộ hiện tại.

## Callback

Callback là hàm được truyền vào thao tác khác để được gọi khi có kết quả. Nhiều tầng callback lồng nhau làm luồng xử lý khó đọc và khó bắt lỗi. Promise giúp biểu diễn kết quả tương lai rõ ràng hơn.

## Promise

Promise có ba trạng thái: `pending`, `fulfilled` và `rejected`. Sau khi đã fulfilled hoặc rejected, trạng thái không đổi nữa.

`then` xử lý kết quả thành công, `catch` xử lý lỗi, và `finally` chạy sau cùng dù thành công hay thất bại. Mỗi lần gọi `then` trả về một promise mới nên có thể tạo chuỗi xử lý.

```js
fetch("/api/courses")
  .then(response => {
    if (!response.ok) throw new Error("Không tải được khóa học");
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error))
  .finally(() => console.log("Đã kết thúc yêu cầu"));
```

## async và await

Hàm có từ khóa `async` luôn trả về một Promise. `await` tạm dừng bên trong hàm async cho đến khi promise hoàn thành rồi trả về giá trị; nếu promise bị từ chối, `await` ném lỗi.

```js
async function loadCourses() {
  try {
    const response = await fetch("/api/courses");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error.message);
    throw error;
  }
}
```

`fetch` chỉ reject khi có lỗi mạng hoặc yêu cầu bị hủy. Mã HTTP 404 hoặc 500 vẫn tạo response, nên cần kiểm tra `response.ok`.

## Chạy tuần tự và song song

Hai `await` liên tiếp chạy tuần tự. Nếu hai tác vụ độc lập, có thể khởi tạo cả hai promise rồi dùng `Promise.all`. `Promise.all` reject ngay khi một promise reject.

`Promise.allSettled` chờ tất cả tác vụ và trả trạng thái từng tác vụ, phù hợp khi vẫn cần kết quả còn lại dù một tác vụ lỗi. `Promise.race` hoàn thành theo promise đầu tiên kết thúc.

## Xử lý lỗi

Nên đặt `try...catch` ở nơi có thể bổ sung thông tin hoặc quyết định cách phục hồi. Không nên bắt lỗi rồi bỏ qua. Ở tầng giao diện, lỗi cần được đổi thành thông báo dễ hiểu; ở tầng dịch vụ, cần giữ thông tin phục vụ log.

## Tránh lỗi thường gặp

- Quên `await` làm nhận một Promise thay vì dữ liệu.
- Không `return` promise trong chuỗi `then` làm chuỗi chạy sai thứ tự.
- Dùng `forEach(async () => ...)` rồi tưởng rằng vòng lặp đã chờ.
- Gọi quá nhiều tác vụ song song mà không giới hạn.
- Không xử lý trạng thái tải, lỗi và dữ liệu rỗng trên giao diện.
