import { Router } from 'express';
import { env } from '../config/env';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: env.nodeEnv,
    ts: new Date().toISOString(),
  });
});

export default router;
