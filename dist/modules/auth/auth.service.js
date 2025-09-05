'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccess = verifyAccess;
exports.verifyRefresh = verifyRefresh;
exports.getUserWithPasswordByEmail = getUserWithPasswordByEmail;
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const argon2_1 = __importDefault(require('argon2'));
const data_source_1 = require('../../db/data-source');
const user_entity_1 = require('../../db/entities/user.entity');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';
const accessOpts = { expiresIn: ACCESS_EXPIRES };
const refreshOpts = { expiresIn: REFRESH_EXPIRES };
async function hashPassword(plain) {
  return argon2_1.default.hash(plain, { type: argon2_1.default.argon2id });
}
async function verifyPassword(hash, plain) {
  return argon2_1.default.verify(hash, plain);
}
function signAccessToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    displayName: user.displayName,
    typ: 'access',
  };
  return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, accessOpts);
}
function signRefreshToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    displayName: user.displayName,
    typ: 'refresh',
  };
  return jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, refreshOpts);
}
function verifyAccess(token) {
  return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
}
function verifyRefresh(token) {
  return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
}
async function getUserWithPasswordByEmail(email) {
  const repo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
  return repo
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email })
    .getOne();
}
//# sourceMappingURL=auth.service.js.map
