'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.postsRepo = void 0;
exports.listPosts = listPosts;
exports.getPostById = getPostById;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.getPostAclMeta = getPostAclMeta;
exports.softDeletePostByIdNoFetch = softDeletePostByIdNoFetch;
const typeorm_1 = require('typeorm');
const data_source_1 = require('../../db/data-source');
const post_entity_1 = require('../../db/entities/post.entity');
const postsRepo = () => data_source_1.AppDataSource.getRepository(post_entity_1.Post);
exports.postsRepo = postsRepo;
function decodeCursor(cursor) {
  try {
    const [createdAt, id] = Buffer.from(cursor, 'base64').toString('utf8').split('|');
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}
function encodeCursor(createdAt, id) {
  return Buffer.from(`${createdAt.toISOString()}|${id}`, 'utf8').toString('base64');
}
async function listPosts(params) {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const qb = (0, exports.postsRepo)()
    .createQueryBuilder('p')
    .select(['p.id', 'p.title', 'p.createdAt', 'p.updatedAt', 'p.authorId'])
    .orderBy('p.createdAt', 'DESC')
    .addOrderBy('p.id', 'DESC')
    .take(limit + 1);
  if (!params.withDeleted) qb.andWhere('p.deletedAt IS NULL');
  if (params.q) {
    if (process.env.USE_FULLTEXT === '1') {
      // Считаем релевантность и сортируем по ней вверху, затем по дате
      qb.addSelect('MATCH(p.title, p.content) AGAINST (:q IN NATURAL LANGUAGE MODE)', 'relevance')
        .andWhere('MATCH(p.title, p.content) AGAINST (:q IN NATURAL LANGUAGE MODE)', {
          q: params.q,
        })
        .orderBy('relevance', 'DESC')
        .addOrderBy('p.createdAt', 'DESC')
        .addOrderBy('p.id', 'DESC');
    } else {
      qb.andWhere('p.title LIKE :like', { like: `%${params.q}%` });
    }
  }
  if (params.authorId) qb.andWhere('p.authorId = :aid', { aid: params.authorId });
  if (params.includeAuthor) {
    qb.leftJoin('p.author', 'a');
    qb.addSelect(['a.id', 'a.displayName']);
  }
  if (params.cursor) {
    const c = decodeCursor(params.cursor);
    if (c) {
      qb.andWhere(
        new typeorm_1.Brackets((w) => {
          w.where('p.createdAt < :cAt', { cAt: c.createdAt }).orWhere(
            new typeorm_1.Brackets((w2) => {
              w2.where('p.createdAt = :cAt', { cAt: c.createdAt }).andWhere('p.id < :cid', {
                cid: c.id,
              });
            }),
          );
        }),
      );
    }
  }
  const rows = await qb.getMany();
  const items = rows.slice(0, limit);
  const nextCursor =
    rows.length > limit
      ? encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
      : null;
  return { items, nextCursor, hasNext: !!nextCursor };
}
async function getPostById(id, includeAuthor = false, withDeleted = false) {
  const repo = (0, exports.postsRepo)();
  if (!includeAuthor) {
    return repo.findOne({
      where: { id },
      withDeleted,
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }
  return repo.findOne({
    where: { id },
    relations: { author: true },
    withDeleted,
    select: {
      id: true,
      title: true,
      content: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      author: { id: true, displayName: true },
    },
  });
}
async function createPost(input) {
  const repo = (0, exports.postsRepo)();
  const post = repo.create(input);
  return repo.save(post);
}
async function updatePost(id, patch) {
  const repo = (0, exports.postsRepo)();
  const existing = await repo.findOne({ where: { id } });
  if (!existing || existing.deletedAt) return null;
  if (patch.title !== undefined) existing.title = patch.title;
  if (patch.content !== undefined) existing.content = patch.content;
  return repo.save(existing);
}
// Узкий SELECT для ACL: без контента и прочего
async function getPostAclMeta(id) {
  return (0, exports.postsRepo)()
    .createQueryBuilder('p')
    .select(['p.id', 'p.authorId', 'p.deletedAt'])
    .withDeleted() // видеть, существует ли уже soft-deleted
    .where('p.id = :id', { id })
    .getOne();
}
// Мягкое удаление без загрузки сущности, с защитой от повторного удаления
async function softDeletePostByIdNoFetch(id) {
  const res = await (0, exports.postsRepo)()
    .createQueryBuilder()
    .update(post_entity_1.Post)
    .set({ deletedAt: () => 'CURRENT_TIMESTAMP(3)' })
    .where('id = :id', { id })
    .andWhere('deletedAt IS NULL') // если уже удалён — не трогаем (будет 0 affected)
    .execute();
  return (res.affected ?? 0) > 0;
}
//# sourceMappingURL=posts.service.js.map
