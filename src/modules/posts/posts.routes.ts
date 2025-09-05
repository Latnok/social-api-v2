import { Router } from 'express';
import { create, getPost, getPosts, patch, remove } from './posts.controller';
import { requireAuth } from '../auth/auth.middleware';
import { validateBody } from '../../middlewares/validate';
import { PostCreateDto, PostPatchDto } from './posts.dto';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);

router.post('/', requireAuth, validateBody(PostCreateDto), create);
router.patch('/:id', requireAuth, validateBody(PostPatchDto), patch);
router.delete('/:id', requireAuth, remove);

export default router;
