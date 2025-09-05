import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

const isDev = process.env.NODE_ENV !== 'production';

export const AppDataSource = new DataSource({
  type: 'mariadb',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT ?? 3306),
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  charset: 'utf8mb4',
  timezone: 'Z',
  entities: [User, Post],
  migrations: [isDev ? 'src/db/migrations/*.ts' : 'dist/db/migrations/*.js'],
  synchronize: false,
  logging: env.nodeEnv === 'development' ? ['error'] : false,
  extra: { connectionLimit: 20 },
  maxQueryExecutionTime: 200
});
