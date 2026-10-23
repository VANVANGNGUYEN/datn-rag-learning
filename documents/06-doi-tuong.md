# Đối tượng trong JavaScript

## Object literal và thuộc tính

Đối tượng lưu dữ liệu theo cặp khóa–giá trị. Object literal dùng cặp ngoặc nhọn để tạo đối tượng. Giá trị của thuộc tính có thể là kiểu nguyên thủy, mảng, đối tượng khác hoặc hàm.

```js
const student = {
  id: 1,
  name: "An",
  score: 8,
  introduce() {
    return `Mình là ${this.name}`;
  }
};
```

Dấu chấm phù hợp khi biết trước tên thuộc tính hợp lệ. Ngoặc vuông dùng khi tên thuộc tính nằm trong biến, có khoảng trắng hoặc được tạo động.

```js
const field = "score";
console.log(student[field]);
```

## Method và this

Method là hàm nằm trong đối tượng. Trong lời gọi `student.introduce()`, `this` thường tham chiếu đến đối tượng đứng trước dấu chấm. Arrow function không có `this` riêng, vì vậy không nên dùng làm method nếu cần truy cập đối tượng qua `this`.

Giá trị của `this` phụ thuộc cách gọi hàm, không chỉ phụ thuộc nơi khai báo. Khi truyền method làm callback riêng lẻ, có thể mất ngữ cảnh; có thể dùng `bind` hoặc một arrow function bao ngoài.

## Tham chiếu và sao chép nông

Đối tượng được gán qua tham chiếu. Nếu hai biến trỏ đến cùng một đối tượng, thay đổi qua biến này được nhìn thấy qua biến kia. Spread `{ ...source }` và `Object.assign` tạo bản sao nông: chỉ lớp ngoài được sao chép, đối tượng lồng nhau vẫn dùng chung tham chiếu.

```js
const copiedStudent = { ...student, score: 9 };
```

## Destructuring

Object destructuring lấy thuộc tính theo tên, cho phép đổi tên và đặt giá trị mặc định.

```js
const { name: studentName, score = 0 } = student;
```

Rest property gom những thuộc tính còn lại vào một đối tượng mới: `const { id, ...profile } = student`.

## Duyệt thuộc tính

`Object.keys(object)` trả mảng khóa, `Object.values(object)` trả mảng giá trị, còn `Object.entries(object)` trả mảng các cặp `[key, value]`. Có thể kết hợp `Object.entries` với `for...of`.

`Object.hasOwn(object, key)` kiểm tra thuộc tính trực tiếp của đối tượng và tránh lấy thuộc tính kế thừa ngoài ý muốn.

## Optional chaining và nullish coalescing

`student.profile?.email` trả về `undefined` nếu `profile` chưa có. Có thể kết hợp với `??` để đặt giá trị mặc định mà vẫn giữ `0`, `false` và chuỗi rỗng.

```js
const email = student.profile?.email ?? "Chưa cập nhật";
```

## JSON

`JSON.stringify` chuyển dữ liệu JavaScript phù hợp thành chuỗi JSON. `JSON.parse` chuyển chuỗi JSON hợp lệ thành giá trị JavaScript. JSON không lưu được hàm, `undefined` hoặc `symbol`, và không hỗ trợ tham chiếu vòng.

## Prototype

Các đối tượng JavaScript có thể kế thừa thuộc tính và method qua prototype chain. Cú pháp `class` giúp cách viết dễ đọc hơn nhưng bên dưới vẫn dựa trên prototype. Với đồ án cơ bản, nên ưu tiên object literal cho dữ liệu đơn giản và class khi cần tạo nhiều đối tượng cùng cấu trúc/hành vi.
