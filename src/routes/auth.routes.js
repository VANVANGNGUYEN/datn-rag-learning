const express = require("express");
const bcrypt = require("bcryptjs");
const config = require("../config");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../utils/http");
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshExpiryDate
} = require("../utils/tokens");

const router = express.Router();
const refreshCookieName = "datn_refresh_token";

function publicUser(user) {
  return {
    userId: Number(user.user_id),
    email: user.email,
    fullName: user.full_name,
    role: user.role
  };
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: config.server.cookieSecure,
    path: "/api/auth",
    maxAge: config.server.refreshTokenDays * 24 * 60 * 60 * 1000
  };
}

function readCookie(request, name) {
  const cookieHeader = request.get("Cookie") || "";
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator === -1) continue;
    const key = item.slice(0, separator).trim();
    if (key === name) return decodeURIComponent(item.slice(separator + 1).trim());
  }
  return null;
}

router.post("/login", asyncHandler(async (request, response) => {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");
  if (!email || !password) throw httpError(400, "Vui lòng nhập email và mật khẩu.");

  const [rows] = await pool.execute(
    `SELECT user_id, email, password_hash, full_name, role, status
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  const user = rows[0];
  const validPassword = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!user || !validPassword || user.status !== "active") {
    throw httpError(401, "Email hoặc mật khẩu không đúng.");
  }

  const refreshToken = createRefreshToken();
  await pool.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [user.user_id, hashRefreshToken(refreshToken), refreshExpiryDate()]
  );

  response.cookie(refreshCookieName, refreshToken, cookieOptions());
  response.json({ accessToken: createAccessToken(user), user: publicUser(user) });
}));

router.post("/refresh", asyncHandler(async (request, response) => {
  const currentToken = readCookie(request, refreshCookieName);
  if (!currentToken) throw httpError(401, "Không tìm thấy refresh token.");

  const currentHash = hashRefreshToken(currentToken);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT u.user_id, u.email, u.full_name, u.role, u.status
       FROM refresh_tokens rt
       JOIN users u ON u.user_id = rt.user_id
       WHERE rt.token_hash = ?
         AND rt.revoked_at IS NULL
         AND rt.expires_at > UTC_TIMESTAMP()
       FOR UPDATE`,
      [currentHash]
    );
    const user = rows[0];
    if (!user || user.status !== "active") {
      await connection.rollback();
      response.clearCookie(refreshCookieName, cookieOptions());
      throw httpError(401, "Refresh token đã hết hạn hoặc bị thu hồi.");
    }

    const nextToken = createRefreshToken();
    const nextHash = hashRefreshToken(nextToken);
    await connection.execute(
      `UPDATE refresh_tokens
       SET revoked_at = UTC_TIMESTAMP(), replaced_by_hash = ?
       WHERE token_hash = ?`,
      [nextHash, currentHash]
    );
    await connection.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [user.user_id, nextHash, refreshExpiryDate()]
    );
    await connection.commit();

    response.cookie(refreshCookieName, nextToken, cookieOptions());
    response.json({ accessToken: createAccessToken(user), user: publicUser(user) });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // Kết nối có thể đã rollback trước khi phát hiện refresh token không hợp lệ.
    }
    throw error;
  } finally {
    connection.release();
  }
}));

router.post("/logout", asyncHandler(async (request, response) => {
  const token = readCookie(request, refreshCookieName);
  if (token) {
    await pool.execute(
      `UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP())
       WHERE token_hash = ?`,
      [hashRefreshToken(token)]
    );
  }
  response.clearCookie(refreshCookieName, cookieOptions());
  response.status(204).end();
}));

router.get("/me", requireAuth, asyncHandler(async (request, response) => {
  const [rows] = await pool.execute(
    `SELECT user_id, email, full_name, role, status
     FROM users WHERE user_id = ? LIMIT 1`,
    [request.user.userId]
  );
  const user = rows[0];
  if (!user || user.status !== "active") throw httpError(401, "Tài khoản không còn hoạt động.");
  response.json({ user: publicUser(user) });
}));

module.exports = router;
