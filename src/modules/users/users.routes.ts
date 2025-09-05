import { Router } from 'express';
import { deleteUser, getUser, getUsers } from './users.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Все роуты защищены: только admin
router.use(requireAuth, requireRole(['admin']));

router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

export default router;
