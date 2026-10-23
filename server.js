const path = require("path");
const express = require("express");
const config = require("./src/config");
const { pool, testConnection } = require("./src/db");
const authRoutes = require("./src/routes/auth.routes");
const courseRoutes = require("./src/routes/courses.routes");
const progressRoutes = require("./src/routes/progress.routes");
const ragRoutes = require("./src/routes/rag.routes");
const adminRoutes = require("./src/routes/admin.routes");

const app = express();
const publicDirectory = path.join(config.projectRoot, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/health", async (_request, response) => {
  try {
    const database = await testConnection();
    response.json({ status: "ok", database });
  } catch (error) {
    response.status(503).json({ status: "error", message: "Không kết nối được MySQL.", detail: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/admin", adminRoutes);
app.use(express.static(publicDirectory));

app.use("/api", (_request, _response, next) => {
  const error = new Error("API không tồn tại.");
  error.status = 404;
  next(error);
});

app.use((request, response, next) => {
  if (request.method === "GET" && request.accepts("html")) {
    return response.sendFile(path.join(publicDirectory, "index.html"));
  }
  return next();
});

app.use((error, _request, response, _next) => {
  const status = error.status || (error.code === "ER_DUP_ENTRY" ? 409 : 500);
  const message = status === 500 ? "Hệ thống gặp lỗi khi xử lý yêu cầu." : error.message;
  if (status === 500) console.error(error);
  response.status(status).json({ error: message, details: error.details || undefined });
});

async function start() {
  const database = await testConnection();
  const server = app.listen(config.server.port, "127.0.0.1", () => {
    console.log(`DATN Learning đang chạy tại http://127.0.0.1:${config.server.port}`);
    console.log(`MySQL: ${database.databaseName} (${database.version})`);
  });

  async function shutdown() {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch(error => {
  console.error("Không thể khởi động server:", error.message);
  console.error("Kiểm tra DB_HOST, DB_PORT, DB_NAME, DB_USER và DB_PASSWORD trong .env.");
  process.exitCode = 1;
});
