'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getPosts = getPosts;
exports.getPost = getPost;
exports.create = create;
exports.patch = patch;
exports.remove = remove;
const error_1 = require('../../middlewares/error');
const posts_service_1 = require('./posts.service');
const posts_cache_1 = require('./posts.cache');
function ensureCanEdit(req, authorId) {
  if (!req.user) throw new error_1.HttpError(401, 'Unauthorized');
  if (req.user.role === 'admin') return;
  if (req.user.id !== String(authorId)) throw new error_1.HttpError(403, 'Forbidden');
}
async function getPosts(req, res) {
  const { limit, cursor, q, authorId, include } = req.query;
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
    const key = (0, posts_cache_1.listKey)(params);
    const cached = await (0, posts_cache_1.getCachedList)(key);
    if (cached) {
      res.set('Cache-Control', `public, max-age=${process.env.CACHE_TTL_POSTS ?? 60}`);
      return res.json(cached);
    }
    const result = await (0, posts_service_1.listPosts)(params);
    await (0, posts_cache_1.setCachedList)(key, result);
    res.set('Cache-Control', `public, max-age=${process.env.CACHE_TTL_POSTS ?? 60}`);
    return res.json(result);
  }
  // авторизованные запросы не кэшируем (можно при желании)
  const result = await (0, posts_service_1.listPosts)(params);
  return res.json(result);
}
async function getPost(req, res) {
  const includeAuthor = req.query.include === 'author';
  const post = await (0, posts_service_1.getPostById)(
    req.params.id,
    includeAuthor,
    req.query.withDeleted === 'true',
  );
  if (!post || (!post.deletedAt && false)) {
    /* keep types happy */
  }
  if (!post || (post.deletedAt && req.query.withDeleted !== 'true'))
    throw new error_1.HttpError(404, 'Post not found');
  res.json(post);
}
async function create(req, res) {
  const { title, content } = req.body;
  if (!title || !content) throw new error_1.HttpError(400, 'title and content are required');
  if (title.length > 200) throw new error_1.HttpError(400, 'title is too long');
  const post = await (0, posts_service_1.createPost)({ title, content, authorId: req.user.id });
  await (0, posts_cache_1.invalidatePostsLists)(); // фид устарел
  res.status(201).json(post);
}
async function patch(req, res) {
  const { title, content } = req.body;
  if (title === undefined && content === undefined)
    throw new error_1.HttpError(400, 'nothing to update');
  const existing = await (0, posts_service_1.getPostAclMeta)(req.params.id);
  if (!existing || existing.deletedAt) throw new error_1.HttpError(404, 'Post not found');
  ensureCanEdit(req, existing.authorId);
  if (title !== undefined && title.length > 200)
    throw new error_1.HttpError(400, 'title is too long');
  const updated = await (0, posts_service_1.updatePost)(existing.id, { title, content });
  if (!updated) throw new error_1.HttpError(404, 'Post not found');
  await (0, posts_cache_1.invalidatePostsLists)();
  res.json(updated);
}
async function remove(req, res) {
  if (!req.user) throw new error_1.HttpError(401, 'Unauthorized');
  const id = req.params.id;
  const meta = await (0, posts_service_1.getPostAclMeta)(id);
  if (!meta || meta.deletedAt) throw new error_1.HttpError(404, 'Post not found');
  const isAdmin = req.user.role === 'admin';
  const isAuthor = req.user.id === String(meta.authorId);
  if (!isAdmin && !isAuthor) throw new error_1.HttpError(403, 'Forbidden');
  const ok = await (0, posts_service_1.softDeletePostByIdNoFetch)(id);
  if (!ok) throw new error_1.HttpError(404, 'Post not found');
  await (0, posts_cache_1.invalidatePostsLists)();
  res.status(204).send();
}
//# sourceMappingURL=posts.controller.js.map
