const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");

function assertTokenConfiguration() {
  if (
    !config.server.jwtAccessSecret ||
    config.server.jwtAccessSecret.includes("THAY_BANG") ||
    config.server.jwtAccessSecret.length < 32
  ) {
    throw new Error("JWT_ACCESS_SECRET trong .env phải là chuỗi ngẫu nhiên dài ít nhất 32 ký tự.");
  }
}

function createAccessToken(user) {
  assertTokenConfiguration();
  return jwt.sign(
    { role: user.role, email: user.email, name: user.full_name },
    config.server.jwtAccessSecret,
    { subject: String(user.user_id), expiresIn: config.server.accessTokenExpiresIn }
  );
}

function verifyAccessToken(token) {
  assertTokenConfiguration();
  return jwt.verify(token, config.server.jwtAccessSecret);
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiryDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + config.server.refreshTokenDays);
  return date;
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshExpiryDate,
  verifyAccessToken
};
