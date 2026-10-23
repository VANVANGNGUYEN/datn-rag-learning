# Lớp và hướng đối tượng trong JavaScript

## Khai báo class và constructor

`class` là cú pháp dùng để mô tả cách tạo các đối tượng có cùng dữ liệu và hành vi. `constructor` được gọi khi dùng `new` và thường dùng để gán thuộc tính ban đầu.

```js
class Course {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.students = [];
  }

  enroll(student) {
    this.students.push(student);
  }
}

const javascriptCourse = new Course(1, "JavaScript cơ bản");
```

Các method khai báo trong thân class được đặt trên prototype, vì vậy các instance dùng chung method thay vì tạo một bản sao cho từng đối tượng.

## Kế thừa với extends và super

`extends` tạo lớp con kế thừa method từ lớp cha. Trong constructor lớp con, phải gọi `super(...)` trước khi dùng `this`. `super.method()` gọi method của lớp cha khi cần mở rộng hành vi.

```js
class User {
  constructor(name) {
    this.name = name;
  }
}

class Student extends User {
  constructor(name, studentCode) {
    super(name);
    this.studentCode = studentCode;
  }
}
```

Kế thừa nên dùng khi có quan hệ “là một”. Nếu chỉ muốn sử dụng chức năng của đối tượng khác, kết hợp đối tượng thường đơn giản hơn.

## Thuộc tính và method static

Thành viên `static` thuộc về class, không thuộc từng instance. Nó phù hợp cho hàm tiện ích hoặc phương thức tạo đối tượng.

```js
class Score {
  static isValid(value) {
    return Number.isFinite(value) && value >= 0 && value <= 10;
  }
}
```

Gọi bằng `Score.isValid(8)`, không gọi qua một instance của `Score`.

## Trường private

Tên bắt đầu bằng `#` tạo private field và chỉ truy cập được trong thân class. Nó giúp che giấu trạng thái nội bộ.

```js
class Counter {
  #value = 0;

  increase() {
    this.#value += 1;
  }

  get value() {
    return this.#value;
  }
}
```

## Getter và setter

Getter cho phép đọc một giá trị tính toán như thuộc tính. Setter kiểm soát khi gán giá trị. Không nên để getter gây tác dụng phụ khó đoán.

## instanceof

`object instanceof ClassName` kiểm tra prototype chain của đối tượng có chứa `ClassName.prototype` hay không. Nó phù hợp với instance được tạo từ class trong cùng môi trường, nhưng không thay thế hoàn toàn việc kiểm tra cấu trúc dữ liệu đầu vào.

## Nguyên tắc dùng class trong đồ án

Class nên có trách nhiệm rõ ràng và không gom toàn bộ nghiệp vụ vào một lớp lớn. Dữ liệu nhận từ API vẫn phải được kiểm tra, vì object lấy từ JSON không tự trở thành instance của class.
