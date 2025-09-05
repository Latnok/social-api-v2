import type { Request, Response } from 'express';
import { HttpError } from '../../middlewares/error';
import {
  createPost, getPostById, listPosts, updatePost, getPostAclMeta, softDeletePostByIdNoFetch
} from './posts.service';
import { getCachedList, setCachedList, listKey, invalidatePostsLists } from './posts.cache';

function ensureCanEdit(req: Request, authorId: string) {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  if (req.user.role === 'admin') return;
  if (req.user.id !== String(authorId)) throw new HttpError(403, 'Forbidden');
}

export async function getPosts(req: Request, res: Response) {
    const { limit, cursor, q, authorId, include } = req.query as Record<string, string | undefined>;
    const includeAuthor = include === 'author';
    const params = {
      limit: limit ? Number(limit) : undefined,
      cursor: cursor ?? null,
      q: q ?? null,
      authorId: authorId ?? null,
      includeAuthor,
    };
  
    const isPublic = !req.user; // простое правило: кэшируем только публичные запросы
    if (isPublic) {
      const key = listKey(params);
      const cached = await getCachedList(key);
      if (cached) {
        res.set('Cache-Control', `public, max-age=${process.env.CACHE_TTL_POSTS ?? 60}`);
        return res.json(cached);
      }
      const result = await listPosts(params);
      await setCachedList(key, result);
      res.set('Cache-Control', `public, max-age=${process.env.CACHE_TTL_POSTS ?? 60}`);
      return res.json(result);
    }
  
    // авторизованные запросы не кэшируем (можно при желании)
    const result = await listPosts(params);
    return res.json(result);
  }

export async function getPost(req: Request, res: Response) {
  const includeAuthor = req.query.include === 'author';
  const post = await getPostById(req.params.id, includeAuthor, req.query.withDeleted === 'true');
  if (!post || (!post.deletedAt && false)) { /* keep types happy */ }
  if (!post || (post.deletedAt && req.query.withDeleted !== 'true')) throw new HttpError(404, 'Post not found');
  res.json(post);
}

export async function create(req: Request, res: Response) {
    const { title, content } = req.body as { title?: string; content?: string };
    if (!title || !content) throw new HttpError(400, 'title and content are required');
    if (title.length > 200) throw new HttpError(400, 'title is too long');
  
    const post = await createPost({ title, content, authorId: req.user!.id });
    await invalidatePostsLists(); // фид устарел
  
    res.status(201).json(post);
}

  export async function patch(req: Request, res: Response) {
    const { title, content } = req.body as { title?: string; content?: string };
    if (title === undefined && content === undefined) throw new HttpError(400, 'nothing to update');
  
    const existing = await getPostAclMeta(req.params.id);
    if (!existing || existing.deletedAt) throw new HttpError(404, 'Post not found');
    ensureCanEdit(req, existing.authorId);
  
    if (title !== undefined && title.length > 200) throw new HttpError(400, 'title is too long');
  
    const updated = await updatePost(existing.id, { title, content });
    if (!updated) throw new HttpError(404, 'Post not found');
  
    await invalidatePostsLists();
    res.json(updated);
}

export async function remove(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, 'Unauthorized');
  
    const id = req.params.id;
    const meta = await getPostAclMeta(id);
    if (!meta || meta.deletedAt) throw new HttpError(404, 'Post not found');
  
    const isAdmin = req.user.role === 'admin';
    const isAuthor = req.user.id === String(meta.authorId);
    if (!isAdmin && !isAuthor) throw new HttpError(403, 'Forbidden');
  
    const ok = await softDeletePostByIdNoFetch(id);
    if (!ok) throw new HttpError(404, 'Post not found');
  
    await invalidatePostsLists();
    res.status(204).send();
}