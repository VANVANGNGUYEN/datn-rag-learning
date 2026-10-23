# Biến và kiểu dữ liệu trong JavaScript

## Khai báo biến với let, const và var

`let` khai báo biến có phạm vi khối và cho phép gán lại. `const` cũng có phạm vi khối nhưng không cho phép gán lại chính biến đó, vì vậy nên dùng `const` mặc định và chỉ đổi sang `let` khi giá trị cần thay đổi. `var` có phạm vi hàm, cho phép khai báo lại và có cơ chế hoisting dễ gây nhầm; mã JavaScript hiện đại thường hạn chế dùng `var`.

```js
const courseName = "JavaScript cơ bản";
let completedLessons = 0;
completedLessons = 1;
```

Temporal Dead Zone là khoảng thời gian từ đầu khối đến trước dòng khai báo `let` hoặc `const`. Truy cập biến trong khoảng này gây `ReferenceError`.

## Phạm vi của biến

Biến khai báo ngoài hàm có phạm vi toàn cục. Biến nằm trong một hàm có phạm vi hàm. `let` và `const` đặt trong cặp ngoặc nhọn chỉ tồn tại trong khối đó. Phạm vi khối giúp hạn chế việc một biến bị thay đổi ngoài ý muốn.

```js
if (true) {
  const message = "Chỉ dùng trong khối if";
}
// console.log(message); // ReferenceError
```

## Kiểu dữ liệu nguyên thủy

JavaScript có các kiểu nguyên thủy thường gặp: `string`, `number`, `boolean`, `undefined`, `null`, `bigint` và `symbol`. Kiểu `number` dùng cho cả số nguyên và số thực. `bigint` biểu diễn số nguyên lớn hơn giới hạn an toàn của `number`. `symbol` tạo giá trị định danh duy nhất.

`undefined` thường có nghĩa là chưa được gán giá trị. `null` là giá trị do lập trình viên chủ động dùng để biểu diễn không có dữ liệu. Do một đặc điểm lịch sử, `typeof null` trả về chuỗi `"object"`; khi kiểm tra `null` nên so sánh trực tiếp.

```js
let selectedLesson;          // undefined
const currentUser = null;    // chủ động không có người dùng
const total = 10.5;          // number
const largeId = 9007199254740993n; // bigint
```

## typeof, NaN và chuyển kiểu

Toán tử `typeof` trả về tên kiểu dưới dạng chuỗi. `NaN` có nghĩa là kết quả không phải một số hợp lệ nhưng `typeof NaN` vẫn là `"number"`. Nên dùng `Number.isNaN(value)` để kiểm tra `NaN`.

JavaScript có thể tự chuyển kiểu khi dùng một số toán tử. Ví dụ `"5" + 2` tạo chuỗi `"52"`, còn `"5" - 2` tạo số `3`. Để mã dễ hiểu, nên chuyển kiểu tường minh bằng `Number()`, `String()` hoặc `Boolean()`.

## So sánh và chuỗi mẫu

`===` so sánh cả giá trị và kiểu, còn `==` có thể chuyển kiểu trước khi so sánh. Trong phần lớn trường hợp nên dùng `===` và `!==` để tránh kết quả bất ngờ.

Template literal được đặt trong dấu backtick và chèn biểu thức bằng `${...}`. Nó phù hợp khi tạo chuỗi có biến hoặc nhiều dòng.

```js
const student = "An";
const score = 8;
const result = `${student} đạt ${score} điểm`;
```

## Giá trị và tham chiếu

Kiểu nguyên thủy được sao chép theo giá trị. Đối tượng và mảng được quản lý qua tham chiếu. Với `const user = { name: "An" }`, không thể gán `user` sang đối tượng khác nhưng vẫn có thể sửa `user.name`. Muốn hạn chế thay đổi cấp đầu tiên có thể dùng `Object.freeze()`.
