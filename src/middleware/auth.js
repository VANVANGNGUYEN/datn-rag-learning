const { httpError } = require("../utils/http");
const { verifyAccessToken } = require("../utils/tokens");

function requireAuth(request, _response, next) {
  const authorization = request.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(httpError(401, "Bạn cần đăng nhập để sử dụng chức năng này."));
  }

  try {
    const payload = verifyAccessToken(token);
    request.user = {
      userId: Number(payload.sub),
      email: payload.email,
      fullName: payload.name,
      role: payload.role
    };
    return next();
  } catch (_error) {
    return next(httpError(401, "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."));
  }
}

function allowRoles(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(httpError(403, "Bạn không có quyền thực hiện chức năng này."));
    }
    return next();
  };
}

module.exports = { allowRoles, requireAuth };
