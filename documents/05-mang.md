# Mảng trong JavaScript

## Tạo và truy cập mảng

Mảng lưu danh sách có thứ tự và chỉ số bắt đầu từ `0`. Thuộc tính `length` cho biết số phần tử. Truy cập chỉ số không tồn tại trả về `undefined`.

```js
const topics = ["Biến", "Hàm", "Mảng"];
console.log(topics[0]);
console.log(topics.length);
```

`Array.isArray(value)` là cách đáng tin cậy để kiểm tra một giá trị có phải mảng hay không.

## Thêm và xóa phần tử

`push` thêm vào cuối, `pop` xóa phần tử cuối. `unshift` thêm vào đầu, `shift` xóa phần tử đầu. Các phương thức này làm thay đổi mảng gốc.

`slice(start, end)` trả về một mảng mới và không lấy phần tử tại vị trí `end`. `splice(start, deleteCount, ...items)` thay đổi mảng gốc bằng cách xóa hoặc chèn phần tử.

## map, filter và reduce

`map` tạo mảng mới bằng cách biến đổi từng phần tử. `filter` tạo mảng mới chỉ gồm phần tử thỏa điều kiện. `reduce` gộp mảng thành một giá trị dựa trên accumulator.

```js
const scores = [6, 8, 9];
const passed = scores.filter(score => score >= 5);
const doubled = scores.map(score => score * 2);
const total = scores.reduce((sum, score) => sum + score, 0);
```

Nên truyền giá trị khởi tạo cho `reduce` để xử lý được mảng rỗng và làm rõ kiểu của accumulator.

## Tìm kiếm và kiểm tra

`find` trả về phần tử đầu tiên thỏa điều kiện hoặc `undefined`. `findIndex` trả về chỉ số hoặc `-1`. `some` kiểm tra có ít nhất một phần tử thỏa điều kiện. `every` kiểm tra tất cả phần tử.

`includes` kiểm tra một giá trị có nằm trong mảng. Nó dễ đọc hơn khi không cần vị trí.

## Sắp xếp

`sort` thay đổi mảng gốc và mặc định so sánh theo chuỗi. Để sắp xếp số tăng dần cần truyền `(a, b) => a - b`. Nếu cần giữ mảng cũ, sao chép trước bằng spread hoặc dùng `toSorted` trong môi trường hỗ trợ.

```js
const sortedScores = [...scores].sort((a, b) => a - b);
```

## Sao chép và destructuring

Spread `[...items]` tạo bản sao nông. Các object nằm bên trong vẫn dùng chung tham chiếu. Destructuring lấy phần tử theo vị trí và có thể dùng rest để gom phần còn lại.

```js
const [first, second, ...remaining] = topics;
```

## Mảng hai chiều và chuỗi phương thức

Mảng hai chiều là mảng chứa các mảng khác, thường dùng cho bảng dữ liệu. Có thể nối `filter`, `map` và `reduce`, nhưng chuỗi quá dài nên tách thành biến có tên để dễ đọc và tìm lỗi.

Khi thêm, xóa hoặc sắp xếp, cần biết phương thức nào thay đổi mảng gốc. Đây là nguyên nhân thường gặp khiến dữ liệu giao diện bị cập nhật ngoài ý muốn.
