"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const data_source_1 = require("./db/data-source");
async function bootstrap() {
    // 1) Подключаемся к БД
    await data_source_1.AppDataSource.initialize();
    logger_1.logger.info('Database connected.');
    // 2) Поднимаем HTTP
    const app = (0, app_1.createApp)();
    const server = (0, http_1.createServer)(app);
    server.listen(env_1.env.port, () => {
        logger_1.logger.info(`HTTP server listening on http://localhost:${env_1.env.port}`);
    });
    // Грейсфул-шатдаун
    const shutdown = (signal) => {
        logger_1.logger.warn({ signal }, 'Shutting down...');
        server.close(async () => {
            try {
                if (data_source_1.AppDataSource.isInitialized) {
                    await data_source_1.AppDataSource.destroy();
                    logger_1.logger.info('Database connection closed.');
                }
            }
            catch (e) {
                logger_1.logger.error(e, 'Error closing DB connection');
            }
            finally {
                logger_1.logger.info('HTTP server closed.');
                process.exit(0);
            }
        });
        setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
bootstrap().catch((err) => {
    logger_1.logger.error({ err }, 'Bootstrap failed');
    process.exit(1);
});
//# sourceMappingURL=main.js.map