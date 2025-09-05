'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const error_1 = require('../../middlewares/error');
const users_service_1 = require('../users/users.service');
const auth_service_1 = require('./auth.service');
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? 'rt';
const REFRESH_COOKIE_DOMAIN = process.env.REFRESH_COOKIE_DOMAIN || undefined;
const isProd = process.env.NODE_ENV === 'production';
const sameSite = process.env.REFRESH_COOKIE_SAMESITE ?? 'lax';
function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: sameSite, // 'lax'|'strict'|'none'
    secure: isProd || sameSite === 'none', // для SameSite=None обязателен secure
    domain: REFRESH_COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}
const register = async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    throw new error_1.HttpError(400, 'email, password, displayName are required');
  }
  // Юзер уже есть?
  const existing = await (0, auth_service_1.getUserWithPasswordByEmail)(email);
  if (existing) throw new error_1.HttpError(409, 'User with this email already exists');
  const passwordHash = await (0, auth_service_1.hashPassword)(password);
  const user = await (0, users_service_1.createUser)({ email, displayName, passwordHash });
  const accessToken = (0, auth_service_1.signAccessToken)(user);
  const refreshToken = (0, auth_service_1.signRefreshToken)(user);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    accessToken,
  });
};
exports.register = register;
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new error_1.HttpError(400, 'email and password are required');
  const user = await (0, auth_service_1.getUserWithPasswordByEmail)(email);
  if (!user) throw new error_1.HttpError(401, 'Invalid credentials');
  const ok = await (0, auth_service_1.verifyPassword)(user.passwordHash, password);
  if (!ok) throw new error_1.HttpError(401, 'Invalid credentials');
  const accessToken = (0, auth_service_1.signAccessToken)(user);
  const refreshToken = (0, auth_service_1.signRefreshToken)(user);
  setRefreshCookie(res, refreshToken);
  res.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    accessToken,
  });
};
exports.login = login;
const refresh = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] ?? '';
  if (!token) throw new error_1.HttpError(401, 'No refresh token');
  let payload;
  try {
    payload = (0, auth_service_1.verifyRefresh)(token);
  } catch {
    throw new error_1.HttpError(401, 'Invalid refresh token');
  }
  // минимальный stateless refresh — берём данные из payload
  const user = {
    id: payload.sub,
    email: payload.email,
    displayName: payload.displayName,
    role: payload.role,
  };
  const accessToken = (0, auth_service_1.signAccessToken)(user);
  const refreshToken = (0, auth_service_1.signRefreshToken)(user);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
};
exports.refresh = refresh;
const logout = async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    domain: REFRESH_COOKIE_DOMAIN,
    path: '/api/auth',
  });
  res.status(204).send();
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map
