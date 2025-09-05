'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const posts_controller_1 = require('./posts.controller');
const auth_middleware_1 = require('../auth/auth.middleware');
const validate_1 = require('../../middlewares/validate');
const posts_dto_1 = require('./posts.dto');
const router = (0, express_1.Router)();
router.get('/', posts_controller_1.getPosts);
router.get('/:id', posts_controller_1.getPost);
router.post(
  '/',
  auth_middleware_1.requireAuth,
  (0, validate_1.validateBody)(posts_dto_1.PostCreateDto),
  posts_controller_1.create,
);
router.patch(
  '/:id',
  auth_middleware_1.requireAuth,
  (0, validate_1.validateBody)(posts_dto_1.PostPatchDto),
  posts_controller_1.patch,
);
router.delete('/:id', auth_middleware_1.requireAuth, posts_controller_1.remove);
exports.default = router;
//# sourceMappingURL=posts.routes.js.map
