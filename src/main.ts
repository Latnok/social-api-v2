import 'reflect-metadata';
import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { AppDataSource } from './db/data-source';

async function bootstrap() {
  // 1) Подключаемся к БД
  await AppDataSource.initialize();
  logger.info('Database connected.');

  // 2) Поднимаем HTTP
  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    logger.info(`HTTP server listening on http://localhost:${env.port}`);
  });

  // Грейсфул-шатдаун
  const shutdown = (signal: string) => {
    logger.warn({ signal }, 'Shutting down...');
    server.close(async () => {
      try {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
          logger.info('Database connection closed.');
        }
      } catch (e) {
        logger.error(e, 'Error closing DB connection');
      } finally {
        logger.info('HTTP server closed.');
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Bootstrap failed');
  process.exit(1);
});
