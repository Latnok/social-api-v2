"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("../config/env");
const user_entity_1 = require("./entities/user.entity");
const post_entity_1 = require("./entities/post.entity");
const isDev = process.env.NODE_ENV !== 'production';
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mariadb',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
    port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT ?? 3306),
    username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
    password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
    database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: [user_entity_1.User, post_entity_1.Post],
    migrations: [isDev ? 'src/db/migrations/*.ts' : 'dist/db/migrations/*.js'],
    synchronize: false,
    logging: env_1.env.nodeEnv === 'development' ? ['error'] : false,
    extra: { connectionLimit: 20 },
    maxQueryExecutionTime: 200
});
//# sourceMappingURL=data-source.js.map