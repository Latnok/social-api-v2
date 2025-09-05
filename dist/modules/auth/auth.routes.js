"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middlewares/validate");
const auth_dto_1 = require("./auth.dto");
const routeRateLimit_1 = require("../../middlewares/routeRateLimit");
const router = (0, express_1.Router)();
router.post('/register', routeRateLimit_1.authLimiter, (0, validate_1.validateBody)(auth_dto_1.RegisterDto), auth_controller_1.register);
router.post('/login', routeRateLimit_1.loginLimiter, (0, validate_1.validateBody)(auth_dto_1.LoginDto), auth_controller_1.login);
router.post('/refresh', routeRateLimit_1.authLimiter, auth_controller_1.refresh);
router.post('/logout', routeRateLimit_1.authLimiter, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map