import dotenv from 'dotenv';
dotenv.config();

const required = <T = string>(value: T | undefined, name: string): T => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Env var ${name} is required`);
  }
  return value as T;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  // БД параметры добавим на этапе 2
};

export const isProd = env.nodeEnv === 'production';
export const isDev = env.nodeEnv === 'development';
