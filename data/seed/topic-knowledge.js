module.exports = [
  {
    id: "bien-va-kieu-du-lieu",
    title: "Biến và kiểu dữ liệu",
    source: "documents/01-bien-va-kieu-du-lieu.md",
    facts: [
      ["let", "let khai báo biến có phạm vi khối và cho phép gán lại giá trị."],
      ["const", "const khai báo biến có phạm vi khối và không cho phép gán lại chính biến đó."],
      ["var", "var có phạm vi hàm, cho phép khai báo lại và thường được hạn chế trong mã JavaScript hiện đại."],
      ["phạm vi khối", "Biến let hoặc const khai báo trong cặp ngoặc nhọn chỉ tồn tại trong khối đó."],
      ["kiểu nguyên thủy", "Các kiểu nguyên thủy gồm string, number, boolean, undefined, null, bigint và symbol."],
      ["undefined", "undefined thường biểu diễn một biến hoặc thuộc tính chưa được gán giá trị."],
      ["null", "null là giá trị được gán chủ động để biểu diễn không có dữ liệu."],
      ["typeof", "typeof trả về tên kiểu dưới dạng chuỗi, nhưng typeof null có kết quả lịch sử là object."],
      ["so sánh nghiêm ngặt", "Toán tử === so sánh cả giá trị và kiểu mà không tự chuyển kiểu trước khi so sánh."],
      ["template literal", "Template literal dùng dấu backtick và chèn biểu thức bằng cú pháp ${...}." ]
    ],
    applications: [
      {
        question: "Khi một biến đếm cần thay đổi sau mỗi lần lặp, cách khai báo nào phù hợp nhất?",
        options: ["const count = 0", "let count = 0", "Không cần khai báo", "Dùng một chuỗi"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "Biến đếm cần gán lại nên dùng let; const không cho phép gán lại biến."
      },
      {
        question: "Biểu thức nào tránh chuyển kiểu ngầm khi kiểm tra số 5?",
        options: ["value == '5'", "value = 5", "value === 5", "value != 5"],
        correctIndex: 2,
        difficulty: "hard",
        explanation: "=== kiểm tra đồng thời giá trị và kiểu nên không chuyển chuỗi '5' thành số."
      }
    ]
  },
  {
    id: "cau-lenh-dieu-kien",
    title: "Câu lệnh điều kiện",
    source: "documents/02-cau-lenh-dieu-kien.md",
    facts: [
      ["if", "if chạy khối lệnh khi biểu thức điều kiện được chuyển thành true."],
      ["else if", "else if kiểm tra điều kiện bổ sung khi các nhánh trước chưa được chọn."],
      ["truthy", "Giá trị truthy là giá trị được chuyển thành true khi đặt trong ngữ cảnh boolean."],
      ["falsy", "Các giá trị falsy gồm false, 0, -0, 0n, chuỗi rỗng, null, undefined và NaN."],
      ["toán tử &&", "Toán tử && trả toán hạng falsy đầu tiên hoặc toán hạng cuối nếu tất cả đều truthy."],
      ["toán tử ||", "Toán tử || trả toán hạng truthy đầu tiên và có thể thay cả 0 hoặc chuỗi rỗng bằng giá trị mặc định."],
      ["toán tử ??", "Toán tử ?? chỉ lấy vế phải khi vế trái là null hoặc undefined."],
      ["switch", "switch phù hợp khi so sánh một biểu thức với nhiều giá trị xác định và thường cần break ở mỗi case."],
      ["toán tử ba ngôi", "Toán tử điều kiện có dạng condition ? valueIfTrue : valueIfFalse và phù hợp cho lựa chọn ngắn."],
      ["guard clause", "Guard clause xử lý trường hợp không hợp lệ và return sớm để giảm các tầng if lồng nhau."]
    ],
    applications: [
      {
        question: "Muốn giữ nguyên pageSize = 0 nhưng dùng 20 khi pageSize chưa có, biểu thức nào phù hợp?",
        options: ["pageSize || 20", "pageSize && 20", "pageSize ?? 20", "!pageSize"],
        correctIndex: 2,
        difficulty: "medium",
        explanation: "?? chỉ dùng giá trị mặc định với null hoặc undefined nên vẫn giữ số 0."
      },
      {
        question: "Trong switch, quên break sau một case thường gây điều gì?",
        options: ["Lỗi cú pháp", "Chạy tiếp các case sau", "Dừng toàn bộ chương trình", "Tự quay lại case đầu"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "Không có break, luồng xử lý tiếp tục sang case kế tiếp cho đến khi gặp break hoặc hết switch."
      }
    ]
  },
  {
    id: "vong-lap",
    title: "Vòng lặp",
    source: "documents/03-vong-lap.md",
    facts: [
      ["for", "Vòng lặp for phù hợp khi cần phần khởi tạo, điều kiện dừng và bước cập nhật rõ ràng."],
      ["while", "while kiểm tra điều kiện trước mỗi lần lặp nên có thể không chạy lần nào."],
      ["do...while", "do...while chạy phần thân ít nhất một lần rồi mới kiểm tra điều kiện."],
      ["for...of", "for...of duyệt các giá trị của iterable như mảng, chuỗi, Map và Set."],
      ["for...in", "for...in duyệt tên thuộc tính có thể liệt kê của đối tượng."],
      ["break", "break kết thúc ngay vòng lặp gần nhất."],
      ["continue", "continue bỏ qua phần còn lại của lần lặp hiện tại và chuyển sang lần tiếp theo."],
      ["forEach", "forEach gọi callback cho từng phần tử, không tạo mảng mới và không hỗ trợ break để dừng sớm."],
      ["vòng lặp lồng nhau", "Hai vòng lặp mỗi vòng chạy n lần có thể tạo gần n bình phương lượt xử lý."],
      ["vòng lặp vô hạn", "Vòng lặp vô hạn xảy ra khi điều kiện dừng không bao giờ trở thành sai."]
    ],
    applications: [
      {
        question: "Cách nào phù hợp nhất để duyệt trực tiếp từng giá trị trong mảng lessons?",
        options: ["for...in", "for...of", "switch", "do...while bắt buộc"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "for...of được thiết kế để duyệt giá trị của mảng và các iterable."
      },
      {
        question: "Vì sao forEach(async item => ...) không phù hợp khi phải chờ từng tác vụ theo thứ tự?",
        options: ["forEach xóa mảng", "forEach không chờ các Promise từ callback", "async không dùng với mảng", "forEach chỉ chạy một phần tử"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "forEach không chờ Promise mà callback trả về; dùng for...of cùng await cho xử lý tuần tự."
      }
    ]
  },
  {
    id: "ham",
    title: "Hàm",
    source: "documents/04-ham.md",
    facts: [
      ["function declaration", "Function declaration được hoisting nên có thể được gọi trước dòng khai báo trong cùng phạm vi."],
      ["function expression", "Function expression gán một hàm vào biến và chỉ dùng được sau khi biến được khởi tạo."],
      ["arrow function", "Arrow function có cú pháp ngắn và không tạo this riêng."],
      ["tham số mặc định", "Tham số mặc định được sử dụng khi đối số truyền vào là undefined."],
      ["rest parameter", "Rest parameter dùng ... để gom các đối số còn lại thành một mảng."],
      ["return", "return kết thúc hàm và đưa giá trị về nơi gọi; không trả rõ ràng thì kết quả là undefined."],
      ["closure", "Closure cho phép hàm ghi nhớ và truy cập môi trường từ vựng nơi nó được tạo."],
      ["callback", "Callback là hàm được truyền cho hàm khác để được gọi trong quá trình xử lý hoặc khi có kết quả."],
      ["hàm bậc cao", "Hàm bậc cao nhận hàm làm đối số hoặc trả về một hàm."],
      ["hàm thuần", "Hàm thuần cho cùng kết quả với cùng đầu vào và không tạo tác dụng phụ bên ngoài."]
    ],
    applications: [
      {
        question: "Hàm createCounter trả về hàm con vẫn nhớ biến count là ví dụ của khái niệm nào?",
        options: ["Hoisting", "Closure", "JSON", "Vòng lặp"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "Hàm con giữ quyền truy cập biến trong môi trường của hàm ngoài nhờ closure."
      },
      {
        question: "Khi method của object cần dùng this động, lựa chọn nào nên tránh?",
        options: ["Method shorthand", "Function thông thường", "Arrow function làm method", "Gọi qua dấu chấm"],
        correctIndex: 2,
        difficulty: "hard",
        explanation: "Arrow function không tạo this riêng nên không nhận this theo cách gọi method thông thường."
      }
    ]
  },
  {
    id: "mang",
    title: "Mảng",
    source: "documents/05-mang.md",
    facts: [
      ["length", "Thuộc tính length cho biết số phần tử của mảng."],
      ["push và pop", "push thêm phần tử vào cuối mảng, còn pop xóa và trả về phần tử cuối."],
      ["shift và unshift", "shift xóa phần tử đầu, còn unshift thêm phần tử vào đầu mảng."],
      ["slice", "slice trả về một mảng mới trong khoảng đã chọn và không thay đổi mảng gốc."],
      ["splice", "splice thay đổi mảng gốc bằng cách xóa hoặc chèn phần tử tại vị trí xác định."],
      ["map", "map tạo mảng mới bằng cách biến đổi từng phần tử của mảng ban đầu."],
      ["filter", "filter tạo mảng mới chỉ gồm các phần tử làm callback trả về true."],
      ["reduce", "reduce gộp các phần tử thành một giá trị thông qua accumulator."],
      ["find", "find trả về phần tử đầu tiên thỏa điều kiện hoặc undefined nếu không tìm thấy."],
      ["sort", "sort thay đổi mảng gốc và mặc định so sánh các phần tử theo chuỗi."]
    ],
    applications: [
      {
        question: "Muốn lấy các điểm từ 5 trở lên mà không đổi mảng gốc, nên dùng phương thức nào?",
        options: ["filter", "splice", "pop", "sort"],
        correctIndex: 0,
        difficulty: "medium",
        explanation: "filter tạo mảng mới gồm các phần tử thỏa điều kiện."
      },
      {
        question: "Muốn sắp xếp [10, 2, 5] tăng dần theo số, lời gọi nào đúng?",
        options: ["values.sort()", "values.sort((a, b) => a - b)", "values.filter(a => a)", "values.map(a => a - 1)"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "sort mặc định so sánh chuỗi; comparator a - b tạo thứ tự số tăng dần."
      }
    ]
  },
  {
    id: "doi-tuong",
    title: "Đối tượng",
    source: "documents/06-doi-tuong.md",
    facts: [
      ["object literal", "Object literal dùng cặp ngoặc nhọn để tạo đối tượng gồm các cặp khóa và giá trị."],
      ["dấu chấm", "Cú pháp dấu chấm phù hợp khi tên thuộc tính đã biết trước và là tên hợp lệ."],
      ["ngoặc vuông", "Cú pháp ngoặc vuông dùng khi tên thuộc tính nằm trong biến hoặc được tạo động."],
      ["method", "Method là một hàm được lưu trong thuộc tính của đối tượng."],
      ["this", "Trong lời gọi object.method(), this của method thông thường thường là object đứng trước dấu chấm."],
      ["tham chiếu đối tượng", "Gán một đối tượng sang biến khác thường sao chép tham chiếu chứ không tạo đối tượng độc lập."],
      ["object spread", "Cú pháp {...source} tạo bản sao nông nên đối tượng lồng nhau vẫn có thể dùng chung tham chiếu."],
      ["object destructuring", "Object destructuring lấy thuộc tính theo tên và có thể đổi tên hoặc đặt giá trị mặc định."],
      ["Object.entries", "Object.entries trả về mảng các cặp [key, value] của thuộc tính trực tiếp có thể liệt kê."],
      ["JSON", "JSON.stringify tạo chuỗi JSON và JSON.parse chuyển chuỗi JSON hợp lệ thành dữ liệu JavaScript."]
    ],
    applications: [
      {
        question: "Tên thuộc tính được lưu trong biến field. Cách đọc đúng từ student là gì?",
        options: ["student.field", "student[field]", "student->field", "student::field"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "Ngoặc vuông đánh giá biểu thức field và dùng kết quả làm tên thuộc tính."
      },
      {
        question: "Sau const copy = {...original}, vì sao sửa copy.profile.name có thể ảnh hưởng original?",
        options: ["Spread xóa dữ liệu", "Spread chỉ sao chép nông", "const luôn dùng chung mọi biến", "JSON tự đồng bộ"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "Spread chỉ sao chép lớp ngoài; profile lồng bên trong vẫn có thể cùng tham chiếu."
      }
    ]
  },
  {
    id: "lop-va-huong-doi-tuong",
    title: "Lớp và hướng đối tượng",
    source: "documents/07-lop-va-huong-doi-tuong.md",
    facts: [
      ["class", "class mô tả cách tạo các đối tượng có cùng dữ liệu và hành vi."],
      ["constructor", "constructor được gọi khi tạo instance bằng new và thường gán trạng thái ban đầu."],
      ["new", "Toán tử new tạo instance, liên kết prototype và gọi constructor của class."],
      ["method trên prototype", "Method khai báo trong thân class được các instance dùng chung qua prototype."],
      ["extends", "extends tạo lớp con kế thừa hành vi từ lớp cha."],
      ["super", "super gọi constructor hoặc method của lớp cha; trong constructor lớp con phải gọi trước khi dùng this."],
      ["static", "Thành viên static thuộc về class và được gọi qua tên class thay vì qua instance."],
      ["private field", "Tên bắt đầu bằng # tạo trường private chỉ truy cập được trong thân class."],
      ["getter và setter", "Getter và setter kiểm soát cách đọc hoặc gán một giá trị theo cú pháp thuộc tính."],
      ["instanceof", "instanceof kiểm tra prototype chain của đối tượng có chứa prototype của class hay không."]
    ],
    applications: [
      {
        question: "Trong constructor của lớp con, thao tác nào phải thực hiện trước khi dùng this?",
        options: ["Gọi static", "Gọi super(...) ", "Gọi JSON.parse", "Gọi instanceof"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "Constructor lớp con phải gọi super trước khi truy cập this."
      },
      {
        question: "Hàm Score.isValid được khai báo static. Cách gọi nào đúng?",
        options: ["new Score().prototype.isValid()", "Score.isValid(8)", "this.isValid bắt buộc", "isValid.Score(8)"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "Method static thuộc class nên gọi trực tiếp qua tên class."
      }
    ]
  },
  {
    id: "bat-dong-bo",
    title: "Lập trình bất đồng bộ",
    source: "documents/08-bat-dong-bo.md",
    facts: [
      ["event loop", "Event loop đưa callback sẵn sàng vào thực thi khi call stack đã trống."],
      ["callback bất đồng bộ", "Callback bất đồng bộ là hàm được gọi sau khi một thao tác hoặc thời điểm đã hoàn thành."],
      ["Promise", "Promise biểu diễn kết quả tương lai của một thao tác bất đồng bộ."],
      ["trạng thái Promise", "Promise có ba trạng thái pending, fulfilled và rejected; trạng thái đã kết thúc không đổi lại."],
      ["then catch finally", "then xử lý thành công, catch xử lý lỗi và finally chạy sau cùng dù thành công hay thất bại."],
      ["async", "Hàm có từ khóa async luôn trả về một Promise."],
      ["await", "await chờ một Promise bên trong hàm async và ném lỗi nếu Promise bị từ chối."],
      ["Promise.all", "Promise.all chờ tất cả Promise thành công nhưng reject ngay khi một Promise reject."],
      ["Promise.allSettled", "Promise.allSettled chờ tất cả Promise và trả trạng thái của từng tác vụ."],
      ["response.ok", "fetch không tự reject với mã HTTP 404 hoặc 500 nên cần kiểm tra response.ok."]
    ],
    applications: [
      {
        question: "Hai yêu cầu API độc lập cần chạy song song và đều phải thành công. Nên dùng cách nào?",
        options: ["Hai await tuần tự", "Promise.all", "forEach không callback", "JSON.stringify"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "Promise.all cho phép chờ các tác vụ độc lập chạy song song và báo lỗi nếu một tác vụ thất bại."
      },
      {
        question: "Vì sao fetch nhận HTTP 500 vẫn có thể đi vào nhánh thành công của await?",
        options: ["fetch bỏ qua mạng", "fetch chỉ reject với lỗi mạng hoặc hủy, cần kiểm tra response.ok", "HTTP 500 là thành công", "await đổi 500 thành 200"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "fetch trả Response cho lỗi HTTP; chương trình phải tự kiểm tra response.ok."
      }
    ]
  },
  {
    id: "module",
    title: "Module",
    source: "documents/09-module.md",
    facts: [
      ["module", "Module chia chương trình thành các file có trách nhiệm rõ và phạm vi riêng."],
      ["export", "export công khai giá trị từ một module để module khác có thể import."],
      ["import", "import khai báo phụ thuộc và lấy giá trị được export từ module khác."],
      ["named export", "Named export cho phép xuất nhiều giá trị và khi import thường phải dùng đúng tên."],
      ["default export", "Mỗi module có tối đa một default export và bên import có thể tự đặt tên."],
      ["script type module", "Trên trình duyệt, thuộc tính type=module cho phép script dùng cú pháp import và export."],
      ["ES module trong Node.js", "Node.js nhận ES module qua đuôi .mjs hoặc package.json có type là module."],
      ["CommonJS", "CommonJS dùng require và module.exports, phổ biến trong nhiều dự án Node.js."],
      ["dynamic import", "import() trả về Promise và tải module khi chương trình cần đến."],
      ["circular dependency", "Circular dependency xảy ra khi các module phụ thuộc ngược lại nhau trực tiếp hoặc gián tiếp."]
    ],
    applications: [
      {
        question: "Một file xuất nhiều hàm độc lập và muốn tên import rõ ràng. Kiểu export nào phù hợp?",
        options: ["Named export", "Chỉ global variable", "Không export", "JSON.parse"],
        correctIndex: 0,
        difficulty: "medium",
        explanation: "Named export phù hợp khi module công khai nhiều giá trị có tên rõ ràng."
      },
      {
        question: "Cách đơn giản để giảm phụ thuộc vòng giữa module A và B là gì?",
        options: ["Cho A và B import thêm nhau", "Tách phần dùng chung sang module thứ ba", "Đổi mọi biến thành var", "Dùng vòng lặp"],
        correctIndex: 1,
        difficulty: "hard",
        explanation: "Tách trách nhiệm dùng chung sang module thứ ba giúp A và B không còn phụ thuộc ngược."
      }
    ]
  },
  {
    id: "dom-va-su-kien",
    title: "DOM và sự kiện",
    source: "documents/10-dom-va-su-kien.md",
    facts: [
      ["DOM", "DOM biểu diễn tài liệu HTML thành cây đối tượng mà JavaScript có thể đọc và thay đổi."],
      ["querySelector", "querySelector trả phần tử đầu tiên khớp CSS selector hoặc null nếu không tìm thấy."],
      ["querySelectorAll", "querySelectorAll trả NodeList gồm tất cả phần tử khớp selector."],
      ["textContent", "textContent đọc hoặc gán văn bản thuần và không phân tích chuỗi thành HTML."],
      ["innerHTML", "innerHTML phân tích chuỗi thành HTML và có rủi ro chèn mã nếu dùng dữ liệu chưa làm sạch."],
      ["createElement", "document.createElement tạo một phần tử DOM mới nhưng chưa tự thêm vào trang."],
      ["addEventListener", "addEventListener đăng ký hàm xử lý sự kiện mà không ghi đè listener khác."],
      ["target và currentTarget", "event.target là nơi phát sinh sự kiện, còn currentTarget là phần tử đang chạy listener."],
      ["preventDefault", "preventDefault ngăn hành vi mặc định của sự kiện như gửi form hoặc mở liên kết."],
      ["event delegation", "Event delegation đặt listener ở phần tử cha và xử lý sự kiện nổi bọt từ phần tử con."]
    ],
    applications: [
      {
        question: "Khi chỉ hiển thị tên học viên do người dùng nhập, thuộc tính nào an toàn và phù hợp hơn?",
        options: ["innerHTML", "textContent", "outerHTML", "document.write"],
        correctIndex: 1,
        difficulty: "medium",
        explanation: "textContent hiển thị văn bản thuần nên không phân tích dữ liệu thành HTML."
      },
      {
        question: "Danh sách bài học được thêm động. Cách nào giảm việc gắn listener cho từng dòng?",
        options: ["Event delegation ở phần tử cha", "Gọi innerHTML liên tục", "Dùng var toàn cục", "Tắt sự kiện"],
        correctIndex: 0,
        difficulty: "hard",
        explanation: "Event delegation dùng một listener ở cha và nhận sự kiện nổi bọt từ các phần tử con, kể cả phần tử thêm sau."
      }
    ]
  }
];
