import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 60_000, // 1 минута
  limit: 100, // 100 запросов в минуту
  standardHeaders: true,
  legacyHeaders: false,
});
