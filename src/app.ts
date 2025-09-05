import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';

import { logger } from './config/logger';
import { apiRateLimiter } from './middlewares/rateLimiter';
import healthRouter from './routes/health';
import { errorHandler, notFound } from './middlewares/error';

import authRouter from './modules/auth/auth.routes';
import { optionalAuth } from './modules/auth/auth.middleware';

import usersRouter from './modules/users/users.routes';

import postsRouter from './modules/posts/posts.routes';

import swaggerUi from 'swagger-ui-express';
import { openapiSpecification } from './config/swagger';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
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

  app.use(pinoHttp({ logger }));
  app.use(apiRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(compression()); // gzip/deflate/br для списков/контента

  // Пробуем распознать пользователя из Bearer токена (для публичных роутов это опционально)
  app.use(optionalAuth);

  // Роуты
  app.use('/', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/posts', postsRouter);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, { explorer: true }));

  // 404 и ошибки
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
