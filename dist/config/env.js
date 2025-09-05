'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.isDev = exports.isProd = exports.env = void 0;
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config();
const required = (value, name) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Env var ${name} is required`);
  }
  return value;
};
exports.env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  // БД параметры добавим на этапе 2
};
exports.isProd = exports.env.nodeEnv === 'production';
exports.isDev = exports.env.nodeEnv === 'development';
//# sourceMappingURL=env.js.map
