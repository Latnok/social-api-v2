import { Brackets } from 'typeorm';
import { AppDataSource } from '../../db/data-source';
import { Post } from '../../db/entities/post.entity';

export const postsRepo = () => AppDataSource.getRepository(Post);

export type PostsListParams = {
  limit?: number;
  cursor?: string | null;         // base64("createdAt|id")
  q?: string | null;              // поиск по title
  authorId?: string | null;       // фильтр по автору
  includeAuthor?: boolean;        // вернуть краткие данные автора
  withDeleted?: boolean;          // видеть удалённые (только для админских задач)
};

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const [createdAt, id] = Buffer.from(cursor, 'base64').toString('utf8').split('|');
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch { return null; }
}

function encodeCursor(createdAt: Date, id: string) {
  return Buffer.from(`${createdAt.toISOString()}|${id}`, 'utf8').toString('base64');
}

export async function listPosts(params: PostsListParams) {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);

  const qb = postsRepo()
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
        .andWhere('MATCH(p.title, p.content) AGAINST (:q IN NATURAL LANGUAGE MODE)', { q: params.q })
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
        new Brackets((w) => {
          w.where('p.createdAt < :cAt', { cAt: c.createdAt })
           .orWhere(new Brackets((w2) => {
             w2.where('p.createdAt = :cAt', { cAt: c.createdAt }).andWhere('p.id < :cid', { cid: c.id });
           }));
        }),
      );
    }
  }

  const rows = await qb.getMany();
  const items = rows.slice(0, limit);
  const nextCursor =
    rows.length > limit ? encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id) : null;

  return { items, nextCursor, hasNext: !!nextCursor };
}

export async function getPostById(id: string, includeAuthor = false, withDeleted = false) {
  const repo = postsRepo();
  if (!includeAuthor) {
    return repo.findOne({
      where: { id },
      withDeleted,
      select: {
        id: true, title: true, content: true, authorId: true, createdAt: true, updatedAt: true, deletedAt: true
      },
    });
  }
  return repo.findOne({
    where: { id },
    relations: { author: true },
    withDeleted,
    select: {
      id: true, title: true, content: true, authorId: true, createdAt: true, updatedAt: true, deletedAt: true,
      author: { id: true, displayName: true },
    },
  });
}

export async function createPost(input: { title: string; content: string; authorId: string }) {
  const repo = postsRepo();
  const post = repo.create(input);
  return repo.save(post);
}

export async function updatePost(id: string, patch: Partial<Pick<Post, 'title' | 'content'>>) {
  const repo = postsRepo();
  const existing = await repo.findOne({ where: { id } });
  if (!existing || existing.deletedAt) return null;
  if (patch.title !== undefined) existing.title = patch.title;
  if (patch.content !== undefined) existing.content = patch.content;
  return repo.save(existing);
}

// Узкий SELECT для ACL: без контента и прочего
export async function getPostAclMeta(id: string) {
    return postsRepo()
      .createQueryBuilder('p')
      .select(['p.id', 'p.authorId', 'p.deletedAt'])
      .withDeleted()               // видеть, существует ли уже soft-deleted
      .where('p.id = :id', { id })
      .getOne();
  }
  
  // Мягкое удаление без загрузки сущности, с защитой от повторного удаления
  export async function softDeletePostByIdNoFetch(id: string) {
    const res = await postsRepo()
      .createQueryBuilder()
      .update(Post)
      .set({ deletedAt: () => 'CURRENT_TIMESTAMP(3)' })
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')     // если уже удалён — не трогаем (будет 0 affected)
      .execute();
  
    return (res.affected ?? 0) > 0;
  }
  