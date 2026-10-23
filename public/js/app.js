const state = {
  accessToken: null,
  user: null,
  courses: [],
  currentView: "dashboard",
  selectedCourseId: null,
  toastTimer: null
};

const elements = {
  loginView: document.querySelector("#login-view"),
  appView: document.querySelector("#app-view"),
  loginForm: document.querySelector("#login-form"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  loginError: document.querySelector("#login-error"),
  navigation: document.querySelector("#main-navigation"),
  pageContent: document.querySelector("#page-content"),
  pageTitle: document.querySelector("#page-title"),
  pageKicker: document.querySelector("#page-kicker"),
  todayLabel: document.querySelector("#today-label"),
  userName: document.querySelector("#user-name"),
  userRole: document.querySelector("#user-role"),
  userAvatar: document.querySelector("#user-avatar"),
  toast: document.querySelector("#toast"),
  sidebar: document.querySelector("#sidebar"),
  sidebarBackdrop: document.querySelector("#sidebar-backdrop")
};

const roleLabels = { student: "Học viên", teacher: "Giảng viên", admin: "Quản trị viên" };
const demoAccounts = {
  student: ["hocvien@datn.local", "Student@12345"],
  teacher: ["giangvien@datn.local", "Teacher@12345"],
  admin: ["admin@datn.local", "Admin@12345"]
};
const navigationByRole = {
  student: [
    ["dashboard", "⌂", "Tổng quan"], ["courses", "▤", "Khóa học"],
    ["progress", "↗", "Tiến độ"], ["rag", "✦", "Hỏi đáp RAG"]
  ],
  teacher: [
    ["dashboard", "⌂", "Tổng quan giảng dạy"], ["courses", "▤", "Khóa học phụ trách"],
    ["manage", "＋", "Soạn nội dung"], ["rag", "✦", "Kiểm tra RAG"]
  ],
  admin: [
    ["dashboard", "⌂", "Tổng quan hệ thống"], ["users", "◎", "Tài khoản"],
    ["courses", "▤", "Toàn bộ khóa học"], ["manage", "＋", "Nội dung hệ thống"],
    ["rag", "✦", "Kiểm tra RAG"]
  ]
};
const pageInformation = {
  dashboard: ["Tổng quan", "KHÔNG GIAN HỌC TẬP"],
  courses: ["Khóa học", "NỘI DUNG HỌC TẬP"],
  progress: ["Tiến độ", "THEO DÕI HỌC TẬP"],
  rag: ["Hỏi đáp RAG", "TRỢ LÝ THEO HỌC LIỆU"],
  manage: ["Soạn nội dung", "DÀNH CHO GIẢNG VIÊN"],
  users: ["Quản lý tài khoản", "DÀNH CHO QUẢN TRỊ VIÊN"]
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initials(name) {
  return String(name || "User").split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase();
}

function showToast(message, type = "success") {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type === "error" ? "error" : ""}`;
  state.toastTimer = setTimeout(() => { elements.toast.className = "toast"; }, 3200);
}

function setLoading() {
  elements.pageContent.innerHTML = '<div class="loading" aria-label="Đang tải"></div>';
}

async function refreshSession() {
  const response = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
  if (!response.ok) return false;
  const data = await response.json();
  state.accessToken = data.accessToken;
  state.user = data.user;
  return true;
}

async function api(path, options = {}, retry = true) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (state.accessToken) headers.Authorization = `Bearer ${state.accessToken}`;
  const response = await fetch(`/api${path}`, { ...options, headers, credentials: "same-origin" });

  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) return api(path, options, false);
    showLogin();
  }

  if (!response.ok) {
    let message = "Không thể xử lý yêu cầu.";
    try { message = (await response.json()).error || message; } catch (_error) { /* Không có JSON. */ }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function showLogin() {
  state.accessToken = null;
  state.user = null;
  elements.appView.hidden = true;
  elements.loginView.hidden = false;
  elements.loginPassword.value = "";
}

function showApplication() {
  elements.loginView.hidden = true;
  elements.appView.hidden = false;
  elements.userName.textContent = state.user.fullName;
  elements.userRole.textContent = roleLabels[state.user.role];
  elements.userAvatar.textContent = initials(state.user.fullName);
  renderNavigation();
  navigate("dashboard");
}

function renderNavigation() {
  elements.navigation.innerHTML = navigationByRole[state.user.role].map(([id, icon, label]) => `
    <button class="nav-button ${id === state.currentView ? "active" : ""}" type="button" data-view="${id}">
      <span aria-hidden="true">${icon}</span>${label}
    </button>
  `).join("");
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebarBackdrop.classList.remove("show");
}

async function navigate(view) {
  if (!navigationByRole[state.user.role].some(item => item[0] === view)) view = "dashboard";
  state.currentView = view;
  state.selectedCourseId = null;
  const [title, kicker] = pageInformation[view];
  elements.pageTitle.textContent = title;
  elements.pageKicker.textContent = kicker;
  renderNavigation();
  closeSidebar();
  setLoading();
  elements.pageContent.focus();

  try {
    if (view === "dashboard") await renderDashboard();
    if (view === "courses") await renderCourses();
    if (view === "progress") await renderProgress();
    if (view === "rag") await renderRag();
    if (view === "manage") await renderManagement();
    if (view === "users") await renderUsers();
  } catch (error) {
    elements.pageContent.innerHTML = `<div class="panel empty-state"><h3>Không tải được dữ liệu</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
}

async function loadCourses(force = false) {
  if (!state.courses.length || force) {
    const data = await api("/courses");
    state.courses = data.courses;
  }
  return state.courses;
}

function courseCompactRow(course) {
  return `
    <div class="course-row">
      <span class="course-code">${escapeHtml(course.courseCode)}</span>
      <div><h4>${escapeHtml(course.title)}</h4><p>${course.lessonCount} bài học · ${course.documentCount} tài liệu</p></div>
      <button class="link-button" type="button" data-open-course="${course.courseId}">Xem khóa học →</button>
    </div>`;
}

async function renderDashboard() {
  const courses = await loadCourses(true);
  const totalLessons = courses.reduce((sum, course) => sum + Number(course.lessonCount), 0);
  const totalDocuments = courses.reduce((sum, course) => sum + Number(course.documentCount), 0);
  const greeting = new Date().getHours() < 12 ? "Chào buổi sáng" : new Date().getHours() < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  if (state.user.role === "student") {
    const progress = (await api("/progress")).progress;
    const averageProgress = progress.length
      ? Math.round(progress.reduce((sum, item) => sum + Number(item.progressPercent), 0) / progress.length)
      : 0;
    elements.pageTitle.textContent = "Tổng quan học tập";
    elements.pageKicker.textContent = "KHÔNG GIAN HỌC VIÊN";
    elements.pageContent.innerHTML = `
      <section class="page-intro">
        <div><h2>${greeting}, ${escapeHtml(state.user.fullName.split(" ").pop())}!</h2><p>Tiếp tục bài học đang dở và dùng RAG khi cần giải thích từ đúng tài liệu.</p></div>
        <button class="button button-primary" type="button" data-view="courses">Tiếp tục học →</button>
      </section>
      <section class="metric-grid" aria-label="Số liệu học tập">
        <article class="metric-card"><small>Khóa học của tôi</small><strong>${courses.length}</strong><span>đã được ghi danh</span></article>
        <article class="metric-card"><small>Tổng số bài học</small><strong>${totalLessons}</strong><span>nội dung cần học</span></article>
        <article class="metric-card"><small>Tài liệu tham khảo</small><strong>${totalDocuments}</strong><span>dùng cho RAG</span></article>
        <article class="metric-card"><small>Tiến độ trung bình</small><strong>${averageProgress}%</strong><span>cập nhật gần nhất</span></article>
      </section>
      <section class="dashboard-grid">
        <article class="panel">
          <div class="panel-header"><div><h3>Khóa học đang học</h3><p>Các khóa học bạn đã được ghi danh</p></div><button class="link-button" data-view="courses">Xem tất cả</button></div>
          <div class="course-list-compact">${courses.length ? courses.slice(0, 4).map(courseCompactRow).join("") : '<div class="empty-state">Chưa có khóa học.</div>'}</div>
        </article>
        <aside class="panel">
          <div class="panel-header"><div><h3>Quy trình học gợi ý</h3><p>Đơn giản và dễ theo dõi</p></div></div>
          <div class="study-plan">
            <div class="plan-step"><span>1</span><div><strong>Đọc bài học</strong><p>Nắm khái niệm và chạy lại ví dụ mã.</p></div></div>
            <div class="plan-step"><span>2</span><div><strong>Hỏi trợ lý RAG</strong><p>Yêu cầu giải thích phần chưa hiểu và kiểm tra nguồn.</p></div></div>
            <div class="plan-step"><span>3</span><div><strong>Cập nhật tiến độ</strong><p>Đánh dấu hoàn thành để theo dõi quá trình học.</p></div></div>
          </div>
        </aside>
      </section>`;
    return;
  }

  if (state.user.role === "teacher") {
    const totalStudents = courses.reduce((sum, course) => sum + Number(course.enrollmentCount || 0), 0);
    elements.pageTitle.textContent = "Tổng quan giảng dạy";
    elements.pageKicker.textContent = "KHÔNG GIAN GIẢNG VIÊN";
    elements.pageContent.innerHTML = `
      <section class="page-intro">
        <div><h2>${greeting}, ${escapeHtml(state.user.fullName.split(" ").pop())}!</h2><p>Theo dõi các lớp phụ trách và chuẩn bị nội dung học tập cho học viên.</p></div>
        <button class="button button-primary" type="button" data-view="manage">Soạn nội dung →</button>
      </section>
      <section class="metric-grid" aria-label="Số liệu giảng dạy">
        <article class="metric-card"><small>Khóa học phụ trách</small><strong>${courses.length}</strong><span>chỉ hiển thị khóa được giao</span></article>
        <article class="metric-card"><small>Học viên đang học</small><strong>${totalStudents}</strong><span>lượt ghi danh hoạt động</span></article>
        <article class="metric-card"><small>Bài học đã soạn</small><strong>${totalLessons}</strong><span>trong các khóa phụ trách</span></article>
        <article class="metric-card"><small>Tài liệu đã khai báo</small><strong>${totalDocuments}</strong><span>nguồn học liệu</span></article>
      </section>
      <section class="dashboard-grid">
        <article class="panel">
          <div class="panel-header"><div><h3>Lớp đang phụ trách</h3><p>Giảng viên chỉ xem và sửa khóa học của mình</p></div><button class="link-button" data-view="courses">Xem chi tiết</button></div>
          <div class="course-list-compact">${courses.length ? courses.map(courseCompactRow).join("") : '<div class="empty-state">Chưa được giao khóa học.</div>'}</div>
        </article>
        <aside class="panel">
          <div class="panel-header"><div><h3>Công việc giảng dạy</h3><p>Các bước chính trong tuần 6</p></div></div>
          <div class="study-plan">
            <div class="plan-step"><span>1</span><div><strong>Kiểm tra khóa học</strong><p>Xem số bài học, tài liệu và học viên đang tham gia.</p></div></div>
            <div class="plan-step"><span>2</span><div><strong>Soạn nội dung</strong><p>Thêm bài học hoặc khai báo tài liệu mới.</p></div></div>
            <div class="plan-step"><span>3</span><div><strong>Kiểm tra RAG</strong><p>Đặt câu hỏi thử để kiểm tra nguồn truy xuất.</p></div></div>
          </div>
        </aside>
      </section>`;
    return;
  }

  const { summary } = await api("/admin/summary");
  elements.pageTitle.textContent = "Tổng quan hệ thống";
  elements.pageKicker.textContent = "KHÔNG GIAN QUẢN TRỊ VIÊN";
  elements.pageContent.innerHTML = `
    <section class="page-intro">
      <div><h2>${greeting}, ${escapeHtml(state.user.fullName.split(" ").pop())}!</h2><p>Kiểm tra tài khoản, khóa học và tình trạng dữ liệu chung của hệ thống.</p></div>
      <button class="button button-primary" type="button" data-view="users">Quản lý tài khoản →</button>
    </section>
    <section class="metric-grid" aria-label="Số liệu hệ thống">
      <article class="metric-card"><small>Tổng tài khoản</small><strong>${summary.totalUsers}</strong><span>${summary.activeCount} tài khoản hoạt động</span></article>
      <article class="metric-card"><small>Tổng khóa học</small><strong>${summary.courseCount}</strong><span>${summary.enrollmentCount} lượt ghi danh</span></article>
      <article class="metric-card"><small>Tổng bài học</small><strong>${summary.lessonCount}</strong><span>nội dung toàn hệ thống</span></article>
      <article class="metric-card"><small>Tổng tài liệu</small><strong>${summary.documentCount}</strong><span>nguồn dữ liệu RAG</span></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel">
        <div class="panel-header"><div><h3>Toàn bộ khóa học</h3><p>Dữ liệu tổng hợp để quản trị kiểm tra</p></div><button class="link-button" data-view="courses">Xem tất cả</button></div>
        <div class="course-list-compact">${courses.length ? courses.slice(0, 4).map(courseCompactRow).join("") : '<div class="empty-state">Chưa có khóa học.</div>'}</div>
      </article>
      <aside class="panel">
        <div class="panel-header"><div><h3>Cơ cấu tài khoản</h3><p>Phân bố người dùng theo vai trò</p></div></div>
        <div class="role-summary">
          <div><span>HV</span><p><strong>${summary.studentCount}</strong> Học viên</p></div>
          <div><span>GV</span><p><strong>${summary.teacherCount}</strong> Giảng viên</p></div>
          <div><span>QT</span><p><strong>${summary.adminCount}</strong> Quản trị viên</p></div>
        </div>
      </aside>
    </section>`;
}

function courseCard(course) {
  const description = course.description || "Khóa học đang được cập nhật nội dung.";
  const audience = state.user.role === "student"
    ? "Khóa học đã ghi danh"
    : `${Number(course.enrollmentCount || 0)} học viên`;
  return `
    <article class="course-card">
      <div class="course-card-top"><span class="tag ${course.status === "draft" ? "tag-draft" : ""}">${escapeHtml(course.status)}</span><span class="course-code">${escapeHtml(course.courseCode)}</span></div>
      <h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(description)}</p>
      <div class="course-meta"><span>${course.lessonCount} bài học</span><span>${course.documentCount} tài liệu</span><span>${audience}</span></div>
      <button class="button button-secondary" type="button" data-open-course="${course.courseId}">Mở khóa học</button>
    </article>`;
}

async function renderCourses() {
  const courses = await loadCourses(true);
  const introductions = {
    student: ["Khóa học của tôi", "Các khóa học bạn đã được ghi danh để học và cập nhật tiến độ."],
    teacher: ["Khóa học phụ trách", "Chỉ hiển thị các khóa học được phân công cho giảng viên hiện tại."],
    admin: ["Toàn bộ khóa học", "Quản trị viên xem tổng thể nội dung và số lượt ghi danh trong hệ thống."]
  };
  const [heading, description] = introductions[state.user.role];
  elements.pageContent.innerHTML = `
    <section class="page-intro"><div><h2>${heading}</h2><p>${description}</p></div></section>
    <section class="course-grid">${courses.length ? courses.map(courseCard).join("") : '<div class="panel empty-state">Chưa có khóa học phù hợp với tài khoản.</div>'}</section>`;
}

async function openCourse(courseId) {
  setLoading();
  const [courseData, lessonData, documentData] = await Promise.all([
    api(`/courses/${courseId}`), api(`/courses/${courseId}/lessons`), api(`/courses/${courseId}/documents`)
  ]);
  const course = courseData.course;
  state.selectedCourseId = Number(courseId);
  elements.pageTitle.textContent = course.title;

  const lessons = lessonData.lessons.map((lesson, index) => `
    <div class="lesson-item">
      <span class="lesson-number">${String(index + 1).padStart(2, "0")}</span>
      <div><h4>${escapeHtml(lesson.title)}</h4><p>${escapeHtml(lesson.topicTitle || "Chưa gắn chủ đề")}</p></div>
      ${state.user.role === "student" ? `<div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${Number(lesson.progressPercent)}%"></div></div><span class="progress-label">${Number(lesson.progressPercent)}% · <button class="link-button" data-update-progress="${lesson.lessonId}" data-current-progress="${Number(lesson.progressPercent)}">Cập nhật</button></span></div>` : `<span class="tag ${lesson.status === "draft" ? "tag-draft" : ""}">${lesson.status}</span>`}
    </div>`).join("");
  const documents = documentData.documents.map(document => `
    <div class="document-item"><strong>${escapeHtml(document.title)}</strong><span>${escapeHtml(document.topicTitle || document.fileType)} · ${escapeHtml(document.indexingStatus)}</span><span title="${escapeHtml(document.sourcePath)}">${escapeHtml(document.sourcePath)}</span></div>`).join("");

  elements.pageContent.innerHTML = `
    <section class="course-detail-head"><button class="back-button" type="button" data-back-courses>← Trở lại</button><div><span class="tag">${escapeHtml(course.courseCode)}</span><h2>${escapeHtml(course.title)}</h2><p class="muted">${escapeHtml(course.description || "")}</p></div></section>
    <section class="detail-columns">
      <article class="panel"><div class="panel-header"><div><h3>Nội dung bài học</h3><p>${lessonData.lessons.length} bài theo thứ tự</p></div></div><div class="lesson-list">${lessons || '<div class="empty-state">Chưa có bài học.</div>'}</div></article>
      <aside class="panel"><div class="panel-header"><div><h3>Tài liệu học tập</h3><p>Nguồn dùng cho RAG</p></div></div><div class="document-list">${documents || '<div class="empty-state">Chưa có tài liệu.</div>'}</div></aside>
    </section>`;
}

async function renderProgress() {
  const progress = (await api("/progress")).progress;
  elements.pageContent.innerHTML = `
    <section class="page-intro"><div><h2>Tiến độ học tập</h2><p>Tiến độ được tổng hợp từ từng bài học đã mở và hoàn thành.</p></div></section>
    <section class="progress-list">${progress.length ? progress.map(item => `
      <article class="progress-card"><div class="progress-card-head"><div><h3>${escapeHtml(item.title)}</h3><p>${item.completedLessons}/${item.totalLessons} bài đã hoàn thành</p></div><strong>${Number(item.progressPercent)}%</strong></div><div class="progress-track progress-large"><div class="progress-fill" style="width:${Number(item.progressPercent)}%"></div></div></article>`).join("") : '<div class="panel empty-state">Chưa có dữ liệu tiến độ.</div>'}</section>`;
}

async function renderUsers() {
  const users = (await api("/admin/users")).users;
  const activeUsers = users.filter(user => user.status === "active").length;
  elements.pageContent.innerHTML = `
    <section class="page-intro">
      <div><h2>Quản lý tài khoản</h2><p>Quản trị viên xem vai trò và thay đổi trạng thái hoạt động của tài khoản.</p></div>
      <span class="tag">${activeUsers}/${users.length} đang hoạt động</span>
    </section>
    <section class="panel">
      <div class="account-list">
        ${users.map(user => {
          const isCurrentUser = Number(user.userId) === Number(state.user.userId);
          return `
            <article class="account-row">
              <span class="avatar account-avatar">${initials(user.fullName)}</span>
              <div class="account-main"><strong>${escapeHtml(user.fullName)}</strong><span>${escapeHtml(user.email)}</span></div>
              <span class="tag role-tag role-${user.role}">${roleLabels[user.role]}</span>
              <label class="account-status"><span>Trạng thái</span><select data-user-status="${user.userId}" ${isCurrentUser ? "disabled" : ""}>
                <option value="active" ${user.status === "active" ? "selected" : ""}>Hoạt động</option>
                <option value="locked" ${user.status === "locked" ? "selected" : ""}>Đã khóa</option>
                <option value="inactive" ${user.status === "inactive" ? "selected" : ""}>Ngừng hoạt động</option>
              </select></label>
            </article>`;
        }).join("")}
      </div>
    </section>`;

  document.querySelectorAll("[data-user-status]").forEach(select => {
    select.addEventListener("change", async event => {
      event.currentTarget.disabled = true;
      try {
        await api(`/admin/users/${event.currentTarget.dataset.userStatus}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: event.currentTarget.value })
        });
        showToast("Đã cập nhật trạng thái tài khoản.");
      } catch (error) {
        showToast(error.message, "error");
        await renderUsers();
      } finally {
        if (document.body.contains(event.currentTarget)) event.currentTarget.disabled = false;
      }
    });
  });
}

async function renderRag() {
  const courses = await loadCourses();
  const topicGroups = await Promise.all(courses.map(async course => ({
    course,
    topics: (await api(`/courses/${course.courseId}/topics`)).topics
  })));
  const options = topicGroups.flatMap(group => group.topics.map(topic =>
    `<option value="${escapeHtml(topic.slug)}">${escapeHtml(group.course.courseCode)} — ${escapeHtml(topic.title)}</option>`
  )).join("");

  elements.pageContent.innerHTML = `
    <section class="page-intro"><div><h2>Hỏi đáp theo học liệu</h2><p>Câu trả lời được tạo sau khi truy xuất các đoạn tài liệu liên quan và luôn hiển thị nguồn.</p></div></section>
    <section class="chat-layout">
      <article class="panel chat-panel">
        <div id="chat-result" class="chat-welcome"><div class="chat-orb">RAG</div><h3>Bạn đang cần hiểu phần nào?</h3><p>Chọn chủ đề nếu muốn giới hạn phạm vi, sau đó đặt một câu hỏi ngắn và rõ.</p><div class="suggestions"><button data-suggestion="Sự khác nhau giữa let và const là gì?">let và const</button><button data-suggestion="Promise dùng để làm gì?">Promise</button><button data-suggestion="Khi nào nên dùng map thay vì forEach?">map và forEach</button></div></div>
        <form id="rag-form" class="chat-form"><input id="rag-question" maxlength="1000" placeholder="Nhập câu hỏi về JavaScript..." required><button class="button button-primary" type="submit">Gửi câu hỏi →</button></form>
      </article>
      <aside class="panel"><div class="panel-header"><div><h3>Phạm vi nguồn</h3><p>Không chọn để tìm toàn bộ học liệu</p></div></div><label class="field"><span>Chủ đề</span><select id="rag-topic"><option value="">Tất cả chủ đề</option>${options}</select></label><div id="rag-sources" class="source-list"><div class="empty-state">Nguồn tham chiếu sẽ xuất hiện tại đây.</div></div></aside>
    </section>`;

  document.querySelector("#rag-form").addEventListener("submit", handleRagQuestion);
}

async function handleRagQuestion(event) {
  event.preventDefault();
  const input = document.querySelector("#rag-question");
  const topicId = document.querySelector("#rag-topic").value;
  const question = input.value.trim();
  if (!question) return;
  const resultContainer = document.querySelector("#chat-result");
  const sourcesContainer = document.querySelector("#rag-sources");
  resultContainer.className = "chat-result";
  resultContainer.innerHTML = `<div class="message message-user">${escapeHtml(question)}</div><div class="message message-assistant">Đang tìm trong học liệu...</div>`;
  try {
    const result = await api("/rag/ask", { method: "POST", body: JSON.stringify({ question, topicId }) });
    resultContainer.innerHTML = `<div class="message message-user">${escapeHtml(question)}</div><div class="message message-assistant">${escapeHtml(result.answer)}</div>`;
    sourcesContainer.innerHTML = result.sources.length ? result.sources.map((source, index) => `<div class="source-card"><strong>${index + 1}. ${escapeHtml(source.heading)}</strong><span>${escapeHtml(source.source)} · score ${source.score}</span></div>`).join("") : '<div class="empty-state">Không có nguồn đạt ngưỡng.</div>';
    input.value = "";
  } catch (error) {
    resultContainer.innerHTML += `<div class="form-error">${escapeHtml(error.message)}</div>`;
  }
}

async function renderManagement() {
  const courses = await loadCourses(true);
  const instructors = state.user.role === "admin"
    ? (await api("/admin/users")).users.filter(user => user.role === "teacher" && user.status === "active")
    : [];
  elements.pageTitle.textContent = state.user.role === "admin" ? "Nội dung hệ thống" : "Soạn nội dung";
  elements.pageKicker.textContent = state.user.role === "admin" ? "DÀNH CHO QUẢN TRỊ VIÊN" : "DÀNH CHO GIẢNG VIÊN";
  const courseOptions = courses.map(course => `<option value="${course.courseId}">${escapeHtml(course.courseCode)} — ${escapeHtml(course.title)}</option>`).join("");
  const instructorField = state.user.role === "admin" ? `<label class="field field-full"><span>Giảng viên phụ trách</span><select name="instructorId" required><option value="">Chọn giảng viên</option>${instructors.map(user => `<option value="${user.userId}">${escapeHtml(user.fullName)} — ${escapeHtml(user.email)}</option>`).join("")}</select></label>` : "";
  elements.pageContent.innerHTML = `
    <section class="page-intro"><div><h2>${state.user.role === "admin" ? "Quản lý nội dung toàn hệ thống" : "Soạn nội dung học tập"}</h2><p>Tạo khóa học, bài học và khai báo tài liệu. Nội dung mới ở trạng thái nháp để kiểm tra trước khi công bố.</p></div></section>
    <section class="management-grid">
      <article class="panel"><div class="panel-header"><div><h3>Tạo khóa học</h3><p>Thông tin cơ bản</p></div></div><form id="course-form" class="form-grid"><label class="field"><span>Mã khóa học</span><input name="courseCode" placeholder="JS_ADVANCED" required></label><label class="field"><span>Tên khóa học</span><input name="title" placeholder="JavaScript nâng cao" required></label>${instructorField}<label class="field field-full"><span>Mô tả</span><textarea name="description" placeholder="Mục tiêu và nội dung chính"></textarea></label><button class="button button-primary field-full" type="submit">Tạo khóa học</button></form></article>
      <article class="panel"><div class="panel-header"><div><h3>Thêm bài học</h3><p>Gắn bài học với một chủ đề</p></div></div>${courses.length ? `<form id="lesson-form" class="form-grid"><label class="field field-full"><span>Khóa học</span><select id="manage-course" name="courseId">${courseOptions}</select></label><label class="field"><span>Tên bài học</span><input name="title" required></label><label class="field"><span>Slug</span><input name="slug" placeholder="ham-trong-javascript" required></label><label class="field field-full"><span>Chủ đề</span><select id="manage-topic" name="topicId"></select></label><label class="field field-full"><span>Nội dung tóm tắt</span><textarea name="content"></textarea></label><button class="button button-primary field-full" type="submit">Thêm bài học</button></form>` : '<div class="empty-state">Hãy tạo khóa học trước.</div>'}</article>
      <article class="panel"><div class="panel-header"><div><h3>Thêm tài liệu</h3><p>Khai báo nguồn văn bản hoặc PDF</p></div></div>${courses.length ? `<form id="document-form" class="form-grid"><label class="field field-full"><span>Khóa học</span><select id="document-course" name="courseId">${courseOptions}</select></label><label class="field"><span>Tên tài liệu</span><input name="title" required></label><label class="field"><span>Loại</span><select name="fileType"><option value="text">Văn bản</option><option value="pdf">PDF</option></select></label><label class="field"><span>Tên file</span><input name="fileName" required></label><label class="field"><span>Đường dẫn nguồn</span><input name="sourcePath" placeholder="documents/tai-lieu.md" required></label><label class="field"><span>Chủ đề</span><select id="document-topic" name="topicId"></select></label><label class="field"><span>Bài học</span><select id="document-lesson" name="lessonId"></select></label><button class="button button-primary field-full" type="submit">Thêm tài liệu</button></form>` : '<div class="empty-state">Hãy tạo khóa học trước.</div>'}</article>
      <article class="panel"><div class="panel-header"><div><h3>Dữ liệu hiện có</h3><p>Tổng hợp nhanh</p></div></div><div class="course-list-compact">${courses.map(courseCompactRow).join("") || '<div class="empty-state">Chưa có dữ liệu.</div>'}</div></article>
    </section>`;

  document.querySelector("#course-form").addEventListener("submit", handleCreateCourse);
  if (courses.length) {
    await populateManagementFields(courses[0].courseId);
    document.querySelector("#manage-course").addEventListener("change", event => populateLessonTopics(event.target.value));
    document.querySelector("#document-course").addEventListener("change", event => populateDocumentFields(event.target.value));
    document.querySelector("#lesson-form").addEventListener("submit", handleCreateLesson);
    document.querySelector("#document-form").addEventListener("submit", handleCreateDocument);
  }
}

async function populateLessonTopics(courseId) {
  const topics = (await api(`/courses/${courseId}/topics`)).topics;
  document.querySelector("#manage-topic").innerHTML = topics.map(topic => `<option value="${topic.topicId}">${escapeHtml(topic.title)}</option>`).join("");
}

async function populateDocumentFields(courseId) {
  const [topicData, lessonData] = await Promise.all([api(`/courses/${courseId}/topics`), api(`/courses/${courseId}/lessons`)]);
  document.querySelector("#document-topic").innerHTML = '<option value="">Chưa gắn</option>' + topicData.topics.map(topic => `<option value="${topic.topicId}">${escapeHtml(topic.title)}</option>`).join("");
  document.querySelector("#document-lesson").innerHTML = '<option value="">Chưa gắn</option>' + lessonData.lessons.map(lesson => `<option value="${lesson.lessonId}">${escapeHtml(lesson.title)}</option>`).join("");
}

async function populateManagementFields(courseId) {
  await Promise.all([populateLessonTopics(courseId), populateDocumentFields(courseId)]);
}

async function handleCreateCourse(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await api("/courses", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) });
    showToast("Đã tạo khóa học ở trạng thái nháp.");
    state.courses = [];
    await renderManagement();
  } catch (error) { showToast(error.message, "error"); }
}

async function handleCreateLesson(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api(`/courses/${form.courseId}/lessons`, { method: "POST", body: JSON.stringify(form) });
    showToast("Đã thêm bài học.");
    state.courses = [];
    await renderManagement();
  } catch (error) { showToast(error.message, "error"); }
}

async function handleCreateDocument(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api(`/courses/${form.courseId}/documents`, { method: "POST", body: JSON.stringify(form) });
    showToast("Đã thêm tài liệu, trạng thái đang chờ lập chỉ mục.");
    state.courses = [];
    await renderManagement();
  } catch (error) { showToast(error.message, "error"); }
}

async function updateProgress(lessonId, currentProgress) {
  const nextProgress = currentProgress >= 100 ? 25 : Math.min(100, currentProgress + 25);
  try {
    await api(`/progress/${lessonId}`, { method: "PUT", body: JSON.stringify({ progressPercent: nextProgress }) });
    showToast(`Đã cập nhật tiến độ lên ${nextProgress}%.`);
    await openCourse(state.selectedCourseId);
  } catch (error) { showToast(error.message, "error"); }
}

elements.loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  elements.loginError.textContent = "";
  const submitButton = event.currentTarget.querySelector("button[type=submit]");
  submitButton.disabled = true;
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email: elements.loginEmail.value, password: elements.loginPassword.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không đăng nhập được.");
    state.accessToken = data.accessToken;
    state.user = data.user;
    state.courses = [];
    showApplication();
  } catch (error) {
    elements.loginError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#toggle-password").addEventListener("click", event => {
  const showing = elements.loginPassword.type === "text";
  elements.loginPassword.type = showing ? "password" : "text";
  event.currentTarget.textContent = showing ? "Hiện" : "Ẩn";
});

document.querySelectorAll("[data-demo-role]").forEach(button => {
  button.addEventListener("click", () => {
    const [email, password] = demoAccounts[button.dataset.demoRole];
    elements.loginEmail.value = email;
    elements.loginPassword.value = password;
    elements.loginError.textContent = "Đã điền tài khoản demo. Nhấn Đăng nhập để tiếp tục.";
  });
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try { await api("/auth/logout", { method: "POST" }, false); } catch (_error) { /* Vẫn xóa phiên phía client. */ }
  state.courses = [];
  showLogin();
});

document.querySelector("#menu-button").addEventListener("click", () => {
  elements.sidebar.classList.add("open");
  elements.sidebarBackdrop.classList.add("show");
});
elements.sidebarBackdrop.addEventListener("click", closeSidebar);

document.addEventListener("click", async event => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) return navigate(viewButton.dataset.view);
  const courseButton = event.target.closest("[data-open-course]");
  if (courseButton) {
    try { await openCourse(courseButton.dataset.openCourse); } catch (error) { showToast(error.message, "error"); }
    return;
  }
  if (event.target.closest("[data-back-courses]")) return renderCourses();
  const progressButton = event.target.closest("[data-update-progress]");
  if (progressButton) return updateProgress(Number(progressButton.dataset.updateProgress), Number(progressButton.dataset.currentProgress));
  const suggestion = event.target.closest("[data-suggestion]");
  if (suggestion) {
    const input = document.querySelector("#rag-question");
    if (input) { input.value = suggestion.dataset.suggestion; input.focus(); }
  }
});

async function boot() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" }).format(new Date());
  try {
    const restored = await refreshSession();
    if (restored) showApplication();
    else showLogin();
  } catch (_error) {
    showLogin();
  }
}

boot();
