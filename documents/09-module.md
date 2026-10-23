# Module trong JavaScript

## Mục đích của module

Module chia chương trình thành các file có trách nhiệm rõ ràng. Biến và hàm trong module không tự động trở thành biến toàn cục. Việc khai báo rõ phần xuất và phần nhập giúp biết một file phụ thuộc vào file nào.

## Named export và named import

Named export cho phép một file xuất nhiều giá trị. Khi import phải dùng đúng tên, nhưng có thể đổi tên bằng `as`.

```js
// score.js
export function calculateAverage(scores) {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export const passingScore = 5;

// app.js
import { calculateAverage, passingScore as minimum } from "./score.js";
```

## Default export

Mỗi module có tối đa một default export. Khi import default có thể đặt tên tùy ý. Named export thường rõ ràng hơn khi file có nhiều chức năng; default export phù hợp khi file có một thành phần chính.

```js
// course-service.js
export default class CourseService {}

// app.js
import CourseService from "./course-service.js";
```

## ES module trên trình duyệt và Node.js

Trên trình duyệt, dùng `<script type="module" src="app.js"></script>`. Đường dẫn import tương đối thường phải có phần mở rộng file. Module được tải theo chế độ strict và script module mặc định được hoãn thực thi đến khi HTML được phân tích.

Trong Node.js, có thể dùng ES module khi file có đuôi `.mjs` hoặc `package.json` đặt `"type": "module"`. CommonJS dùng `require` và `module.exports`; không nên trộn hai hệ module tùy tiện trong cùng dự án.

Nguyên mẫu Tuần 1-5 dùng CommonJS để lệnh Node.js dễ chạy. Frontend về sau có thể dùng ES module theo chuẩn trình duyệt.

## Dynamic import

`import()` trả về Promise và tải module khi thật sự cần. Nó phù hợp để giảm phần mã tải ban đầu hoặc chọn module theo tình huống.

```js
const reportModule = await import("./report.js");
reportModule.createReport();
```

## Re-export và file tổng hợp

Một module có thể xuất lại giá trị từ module khác. File tổng hợp giúp import ngắn hơn nhưng nếu gom quá nhiều thứ có thể che giấu phụ thuộc và tạo vòng lặp phụ thuộc.

## Circular dependency

Circular dependency xảy ra khi module A phụ thuộc B và B lại phụ thuộc A, trực tiếp hoặc gián tiếp. Một số trường hợp vẫn chạy nhưng giá trị có thể chưa được khởi tạo vào lúc sử dụng. Cách xử lý là tách phần dùng chung sang module thứ ba hoặc điều chỉnh trách nhiệm.

## Cách tổ chức module

- Mỗi file có một trách nhiệm chính.
- Tên export mô tả rõ dữ liệu hoặc hành động.
- Tránh module vừa truy cập dữ liệu, vừa xử lý nghiệp vụ, vừa cập nhật giao diện.
- Không đặt khóa bí mật trong mã frontend; biến môi trường bí mật chỉ dùng ở backend.
