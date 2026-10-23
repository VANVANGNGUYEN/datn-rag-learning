# Câu lệnh điều kiện trong JavaScript

## if, else if và else

`if` chạy một khối lệnh khi biểu thức điều kiện có giá trị đúng. `else if` kiểm tra thêm điều kiện, còn `else` xử lý trường hợp còn lại. Nên sắp xếp điều kiện từ cụ thể đến tổng quát và dùng ngoặc nhọn để mã dễ đọc.

```js
if (score >= 8.5) {
  console.log("Giỏi");
} else if (score >= 7) {
  console.log("Khá");
} else {
  console.log("Cần cố gắng");
}
```

## Giá trị truthy và falsy

Khi đặt trong điều kiện, JavaScript chuyển giá trị về boolean. Các giá trị falsy gồm `false`, `0`, `-0`, `0n`, chuỗi rỗng, `null`, `undefined` và `NaN`. Hầu hết giá trị khác là truthy, kể cả chuỗi `"0"`, mảng rỗng và đối tượng rỗng.

Không nên dùng kiểm tra truthy nếu số `0` hoặc chuỗi rỗng là dữ liệu hợp lệ. Khi đó nên so sánh rõ với `null` hoặc `undefined`.

## Toán tử logic

`&&` trả về toán hạng falsy đầu tiên, hoặc toán hạng cuối nếu tất cả đều truthy. `||` trả về toán hạng truthy đầu tiên. Vì vậy hai toán tử này không nhất thiết trả về boolean.

Toán tử phủ định `!` đổi truthy thành `false` và falsy thành `true`. Hai lần phủ định `!!value` chuyển một giá trị sang boolean.

Toán tử `??` chỉ dùng giá trị bên phải khi bên trái là `null` hoặc `undefined`. Khác với `||`, nó giữ lại `0`, `false` và chuỗi rỗng.

```js
const pageSize = inputSize ?? 20;
const displayName = userName || "Khách";
```

## switch

`switch` phù hợp khi so sánh một biểu thức với nhiều giá trị xác định. Việc so sánh dùng quy tắc nghiêm ngặt giống `===`. Cần dùng `break` để không chạy tiếp sang nhánh sau, trừ khi cố ý gộp nhiều trường hợp.

```js
switch (role) {
  case "student":
    console.log("Học viên");
    break;
  case "teacher":
    console.log("Giảng viên");
    break;
  default:
    console.log("Không xác định");
}
```

## Toán tử ba ngôi

Toán tử `condition ? valueIfTrue : valueIfFalse` phù hợp khi chọn một trong hai giá trị ngắn. Không nên lồng nhiều toán tử ba ngôi vì khó đọc.

```js
const status = score >= 5 ? "Đạt" : "Chưa đạt";
```

## Optional chaining và guard clause

Optional chaining `?.` dừng truy cập và trả về `undefined` nếu phần bên trái là `null` hoặc `undefined`. Ví dụ `student.profile?.email` tránh lỗi khi chưa có `profile`.

Guard clause là cách xử lý trường hợp không hợp lệ và `return` sớm. Nó giúp giảm nhiều tầng `if` lồng nhau.

```js
function submitScore(score) {
  if (!Number.isFinite(score)) return "Điểm không hợp lệ";
  if (score < 0 || score > 10) return "Điểm ngoài phạm vi";
  return "Đã lưu";
}
```
