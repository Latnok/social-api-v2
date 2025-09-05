import { Router } from 'express';
import { login, logout, refresh, register } from './auth.controller';
import { validateBody } from '../../middlewares/validate';
import { RegisterDto, LoginDto } from './auth.dto';
import { authLimiter, loginLimiter } from '../../middlewares/routeRateLimit';

const router = Router();

router.post('/register', authLimiter, validateBody(RegisterDto), register);
router.post('/login', loginLimiter, validateBody(LoginDto), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', authLimiter, logout);

export default router;
