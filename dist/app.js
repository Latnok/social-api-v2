'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require('express'));
const compression_1 = __importDefault(require('compression'));
const helmet_1 = __importDefault(require('helmet'));
const cors_1 = __importDefault(require('cors'));
const pino_http_1 = __importDefault(require('pino-http'));
const cookie_parser_1 = __importDefault(require('cookie-parser'));
const logger_1 = require('./config/logger');
const rateLimiter_1 = require('./middlewares/rateLimiter');
const health_1 = __importDefault(require('./routes/health'));
const error_1 = require('./middlewares/error');
const auth_routes_1 = __importDefault(require('./modules/auth/auth.routes'));
const auth_middleware_1 = require('./modules/auth/auth.middleware');
const users_routes_1 = __importDefault(require('./modules/users/users.routes'));
const posts_routes_1 = __importDefault(require('./modules/posts/posts.routes'));
const swagger_ui_express_1 = __importDefault(require('swagger-ui-express'));
const swagger_1 = require('./config/swagger');
function createApp() {
  const app = (0, express_1.default)();
  app.disable('x-powered-by');
  app.use(
    (0, helmet_1.default)({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    (0, cors_1.default)({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (origins.length === 0 || origins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      maxAge: 600,
    }),
  );
  app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
  app.use(rateLimiter_1.apiRateLimiter);
  app.use(express_1.default.json({ limit: '1mb' }));
  app.use((0, cookie_parser_1.default)());
  app.use((0, compression_1.default)()); // gzip/deflate/br для списков/контента
  // Пробуем распознать пользователя из Bearer токена (для публичных роутов это опционально)
  app.use(auth_middleware_1.optionalAuth);
  // Роуты
  app.use('/', health_1.default);
  app.use('/api/auth', auth_routes_1.default);
  app.use('/api/users', users_routes_1.default);
  app.use('/api/posts', posts_routes_1.default);
  app.use(
    '/docs',
    swagger_ui_express_1.default.serve,
    swagger_ui_express_1.default.setup(swagger_1.openapiSpecification, { explorer: true }),
  );
  // 404 и ошибки
  app.use(error_1.notFound);
  app.use(error_1.errorHandler);
  return app;
}
//# sourceMappingURL=app.js.map
