import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
};

export const isProd = env.nodeEnv === 'production';
export const isDev = env.nodeEnv === 'development';
