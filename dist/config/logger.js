'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require('pino'));
const env_1 = require('./env');
function makeTransport() {
  if (env_1.isProd) return undefined;
  try {
    require.resolve('pino-pretty');
    return {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    };
  } catch {
    return undefined;
  }
}
exports.logger = (0, pino_1.default)({
  level: process.env.LOG_LEVEL ?? (env_1.isProd ? 'info' : 'debug'),
  transport: makeTransport(),
  // скрываем секреты из логов http (pino-http кладёт их в req/res)
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordHash',
    ],
    remove: true,
  },
});
//# sourceMappingURL=logger.js.map
