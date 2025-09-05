import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50, // регистрация/логин/refresh
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, // построже на логин от брутфорса
  standardHeaders: true,
  legacyHeaders: false,
});
