import { AppDataSource } from '../../db/data-source';
import { User } from '../../db/entities/user.entity';
import { Brackets } from 'typeorm';

export const usersRepo = () => AppDataSource.getRepository(User);

export const findUserByEmail = async (email: string) => {
  return usersRepo().findOne({ where: { email } });
};

export const createUser = async (data: Pick<User, 'email' | 'displayName' | 'passwordHash'>) => {
  const repo = usersRepo();
  const user = repo.create({ ...data, role: 'user' });
  return repo.save(user);
};

export type UsersListParams = {
  limit?: number;
  page?: number;                 // offset-пагинация
  cursor?: string | null;        // cursor-пагинация base64("createdAt|id")
  q?: string | null;             // поиск по email/displayName
  withDeleted?: boolean;         // увидеть удалённых (для аудита)
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

export async function listUsers(params: UsersListParams) {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);

  const qb = usersRepo()
    .createQueryBuilder('u')
    .select(['u.id', 'u.email', 'u.displayName', 'u.role', 'u.createdAt', 'u.updatedAt'])
    .orderBy('u.createdAt', 'DESC')
    .addOrderBy('u.id', 'DESC')
    .take(limit + 1); // +1, чтобы понять есть ли следующая страница

  if (!params.withDeleted) qb.andWhere('u.deletedAt IS NULL');

  if (params.q) {
    const like = `%${params.q}%`;
    qb.andWhere(new Brackets((w) => {
      w.where('u.email LIKE :like', { like }).orWhere('u.displayName LIKE :like', { like });
    }));
  }

  if (params.cursor) {
    const c = decodeCursor(params.cursor);
    if (c) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('u.createdAt < :cAt', { cAt: c.createdAt })
           .orWhere(new Brackets((w2) => {
             w2.where('u.createdAt = :cAt', { cAt: c.createdAt }).andWhere('u.id < :cid', { cid: c.id });
           }));
        }),
      );
    }
  } else if (params.page && params.page > 1) {
    qb.skip((params.page - 1) * limit); // offset fallback
  }

  const rows = await qb.getMany();
  const items = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id) : null;

  return { items, nextCursor, hasNext: !!nextCursor };
}

export async function getUserById(id: string, withDeleted = false) {
  return usersRepo().findOne({
    where: { id },
    withDeleted,
    select: ['id', 'email', 'displayName', 'role', 'createdAt', 'updatedAt', 'deletedAt'],
  });
}

export async function softDeleteUser(id: string) {
  // softRemove требует загрузить сущность
  const repo = usersRepo();
  const u = await repo.findOne({ where: { id } });
  if (!u) return false;
  await repo.softRemove(u);
  return true;
}

export async function hardDeleteUser(id: string) {
  const res = await usersRepo().delete(id);
  return res.affected && res.affected > 0;
}
