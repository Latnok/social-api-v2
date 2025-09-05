'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const auth_service_1 = require('./auth.service');
const error_1 = require('../../middlewares/error');
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  req.user = null;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.slice('Bearer '.length);
  try {
    const payload = (0, auth_service_1.verifyAccess)(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      displayName: payload.displayName,
    };
  } catch {
    // игнорируем — просто нет пользователя
  }
  next();
}
function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new error_1.HttpError(401, 'Unauthorized');
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = (0, auth_service_1.verifyAccess)(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      displayName: payload.displayName,
    };
    next();
  } catch {
    throw new error_1.HttpError(401, 'Unauthorized');
  }
}
function requireRole(roles) {
  return (req, _res, next) => {
    if (!req.user) throw new error_1.HttpError(401, 'Unauthorized');
    if (!roles.includes(req.user.role)) throw new error_1.HttpError(403, 'Forbidden');
    next();
  };
}
//# sourceMappingURL=auth.middleware.js.map
