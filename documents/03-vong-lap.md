# Vòng lặp trong JavaScript

## Vòng lặp for

`for` phù hợp khi biết cách khởi tạo, điều kiện dừng và bước cập nhật. Ba phần được viết trên cùng một dòng nhưng phần thân nên giữ ngắn và rõ.

```js
for (let index = 0; index < lessons.length; index += 1) {
  console.log(lessons[index]);
}
```

Lỗi lệch một đơn vị thường xuất hiện khi dùng `<=` thay vì `<`, khiến truy cập phần tử ngoài mảng.

## while và do...while

`while` kiểm tra điều kiện trước mỗi lần lặp, vì vậy có thể không chạy lần nào. `do...while` chạy phần thân ít nhất một lần rồi mới kiểm tra điều kiện.

```js
let attempt = 0;
while (attempt < 3) {
  attempt += 1;
}
```

Cần bảo đảm có biến thay đổi để điều kiện dừng cuối cùng trở thành sai. Nếu không, chương trình có thể rơi vào vòng lặp vô hạn.

## for...of và for...in

`for...of` duyệt các giá trị của đối tượng iterable như mảng, chuỗi, `Map` và `Set`. Đây là lựa chọn dễ đọc khi chỉ cần từng phần tử.

`for...in` duyệt các tên thuộc tính có thể liệt kê của một đối tượng. Không nên dùng `for...in` để duyệt giá trị mảng vì khóa nhận được là chuỗi và có thể bao gồm thuộc tính bổ sung.

```js
for (const lesson of lessons) {
  console.log(lesson.title);
}

for (const key in student) {
  console.log(key, student[key]);
}
```

## break và continue

`break` kết thúc ngay vòng lặp gần nhất. `continue` bỏ qua phần còn lại của lần lặp hiện tại và chuyển sang lần tiếp theo.

```js
for (const score of scores) {
  if (score == null) continue;
  if (score < 0) break;
  console.log(score);
}
```

## Vòng lặp lồng nhau

Vòng lặp lồng nhau dùng khi xử lý dữ liệu hai chiều hoặc so sánh các cặp phần tử. Nếu vòng ngoài chạy `n` lần và vòng trong cũng chạy `n` lần, số thao tác có thể gần `n²`. Với dữ liệu lớn cần cân nhắc `Map` hoặc `Set` để tra cứu nhanh hơn.

## forEach và các phương thức mảng

`forEach` gọi một hàm cho mỗi phần tử và không tạo mảng mới. Không thể dùng `break` để dừng `forEach`. Nếu cần biến đổi hoặc lọc dữ liệu, nên cân nhắc `map`, `filter`, `find`, `some` hoặc `every`.

`await` bên trong callback của `forEach` không làm `forEach` chờ tuần tự. Khi cần chờ từng tác vụ, dùng `for...of` cùng `await`; khi có thể chạy song song, tạo mảng promise và dùng `Promise.all`.

## Chọn vòng lặp

- Dùng `for` khi cần chỉ số hoặc kiểm soát bước nhảy.
- Dùng `while` khi số lần lặp phụ thuộc một điều kiện thay đổi.
- Dùng `for...of` để duyệt giá trị của mảng.
- Dùng `for...in` cho khóa của đối tượng, thường kết hợp `Object.hasOwn()`.
- Dùng các phương thức mảng khi mục tiêu là biến đổi, lọc hoặc tìm kiếm.
