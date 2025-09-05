import * as path from 'path';
import * as fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { AppDataSource } from '../src/db/data-source';

export default async function globalSetup() {
  // загрузим .env.test
  const envTest = path.resolve(process.cwd(), '.env.test');
  if (fs.existsSync(envTest)) dotenv.config({ path: envTest });

  // создаём тестовую БД, если её нет
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const dbName = process.env.DB_NAME ?? 'social_test';

  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await conn.end();

  // миграции
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
}
