'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const users_controller_1 = require('./users.controller');
const auth_middleware_1 = require('../auth/auth.middleware');
const router = (0, express_1.Router)();
// Все роуты защищены: только admin
router.use(auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['admin']));
router.get('/', users_controller_1.getUsers);
router.get('/:id', users_controller_1.getUser);
router.delete('/:id', users_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map
