# Hàm trong JavaScript

## Khai báo hàm và biểu thức hàm

Function declaration có tên và được hoisting, nên có thể gọi trước dòng khai báo. Function expression gán một hàm vào biến và chỉ dùng được sau khi biến đã được khởi tạo.

```js
function calculateAverage(a, b) {
  return (a + b) / 2;
}

const calculateTotal = function (scores) {
  return scores.reduce((sum, score) => sum + score, 0);
};
```

## Arrow function

Arrow function có cú pháp ngắn và không tạo `this` riêng. Nó phù hợp cho callback và các hàm biến đổi dữ liệu. Không nên dùng arrow function làm method khi method cần `this` động của đối tượng.

```js
const square = number => number * number;
```

## Tham số, giá trị mặc định và rest parameter

Tham số mặc định được dùng khi đối số là `undefined`. Rest parameter `...values` gom các đối số còn lại thành một mảng thật.

```js
function greet(name = "Bạn") {
  return `Xin chào ${name}`;
}

function sum(...values) {
  return values.reduce((total, value) => total + value, 0);
}
```

## return

`return` kết thúc hàm và đưa giá trị về nơi gọi. Hàm không có `return`, hoặc chỉ viết `return;`, trả về `undefined`. Mã nằm sau `return` trong cùng nhánh sẽ không chạy.

## Phạm vi và closure

Hàm bên trong có thể truy cập biến của hàm bên ngoài. Closure là sự kết hợp giữa hàm và môi trường từ vựng nơi hàm được tạo, cho phép biến bên ngoài tiếp tục được ghi nhớ sau khi hàm ngoài kết thúc.

```js
function createCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}
```

## Callback và hàm bậc cao

Callback là hàm được truyền cho hàm khác để gọi sau. Hàm bậc cao là hàm nhận hàm làm đối số hoặc trả về một hàm. `map`, `filter` và `setTimeout` đều sử dụng callback.

## Hàm thuần và tác dụng phụ

Hàm thuần luôn cho cùng kết quả với cùng đầu vào và không sửa dữ liệu bên ngoài. Đọc file, cập nhật DOM, gọi API hoặc thay đổi biến toàn cục là tác dụng phụ. Tách phần tính toán thuần khỏi tác dụng phụ giúp kiểm thử dễ hơn.

## Đệ quy

Hàm đệ quy tự gọi lại chính nó và phải có điều kiện dừng. Nếu không có điều kiện dừng phù hợp, chương trình gây lỗi tràn ngăn xếp.

```js
function factorial(number) {
  if (number <= 1) return 1;
  return number * factorial(number - 1);
}
```

## Quy tắc viết hàm dễ đọc

Mỗi hàm nên giải quyết một nhiệm vụ, có tên mô tả hành động và tránh quá nhiều tham số. Khi đầu vào phức tạp, có thể truyền một object để tên các giá trị rõ ràng hơn.
