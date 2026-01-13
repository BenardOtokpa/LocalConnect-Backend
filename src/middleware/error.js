const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const payload = {
    ok: false,
    message: err.message || "Server error",
    details: err.details || undefined
  };
  if (process.env.NODE_ENV !== "production") payload.stack = err.stack;
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
