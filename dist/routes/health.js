'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const env_1 = require('../config/env');
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: env_1.env.nodeEnv,
    ts: new Date().toISOString(),
  });
});
exports.default = router;
//# sourceMappingURL=health.js.map
