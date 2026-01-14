const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, "Missing Bearer token"));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.auth = payload; // { sub, role }
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) return next(new ApiError(401, "Unauthorized"));
    if (!roles.includes(req.auth.role))
      return next(new ApiError(403, "Forbidden"));
    next();
  };
}

module.exports = { requireAuth, requireRole };
