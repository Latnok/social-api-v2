'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.errorHandler = exports.notFound = exports.HttpError = void 0;
const logger_1 = require('../config/logger');
class HttpError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
exports.HttpError = HttpError;
const notFound = (req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl, code: 'NOT_FOUND' });
};
exports.notFound = notFound;
const errorHandler = (err, req, res, _next) => {
  const status = err?.status ?? 500;
  const message = err?.message ?? 'Internal Server Error';
  const code = err?.code;
  logger_1.logger.error(
    { err, path: req.originalUrl, method: req.method, status },
    'Unhandled error',
  );
  res.status(status).json({
    error: message,
    ...(code && { code }),
    ...(err?.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV !== 'production' && { stack: err?.stack }),
  });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.js.map
