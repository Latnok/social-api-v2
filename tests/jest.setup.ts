// tests/jest.setup.ts
import { AppDataSource } from '../src/db/data-source';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

beforeEach(async () => {
  // Быстрая очистка таблиц между тестами
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    await qr.query('SET FOREIGN_KEY_CHECKS=0;');
    await qr.query('TRUNCATE TABLE `posts`;');
    await qr.query('TRUNCATE TABLE `users`;');
    await qr.query('SET FOREIGN_KEY_CHECKS=1;');
    await qr.commitTransaction();
  } catch (e) {
    await qr.rollbackTransaction();
    throw e;
  } finally {
    await qr.release();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
