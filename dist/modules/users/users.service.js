'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createUser = exports.findUserByEmail = exports.usersRepo = void 0;
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.softDeleteUser = softDeleteUser;
exports.hardDeleteUser = hardDeleteUser;
const data_source_1 = require('../../db/data-source');
const user_entity_1 = require('../../db/entities/user.entity');
const typeorm_1 = require('typeorm');
const usersRepo = () => data_source_1.AppDataSource.getRepository(user_entity_1.User);
exports.usersRepo = usersRepo;
const findUserByEmail = async (email) => {
  return (0, exports.usersRepo)().findOne({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const createUser = async (data) => {
  const repo = (0, exports.usersRepo)();
  const user = repo.create({ ...data, role: 'user' });
  return repo.save(user);
};
exports.createUser = createUser;
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
async function listUsers(params) {
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const qb = (0, exports.usersRepo)()
    .createQueryBuilder('u')
    .select(['u.id', 'u.email', 'u.displayName', 'u.role', 'u.createdAt', 'u.updatedAt'])
    .orderBy('u.createdAt', 'DESC')
    .addOrderBy('u.id', 'DESC')
    .take(limit + 1); // +1, чтобы понять есть ли следующая страница
  if (!params.withDeleted) qb.andWhere('u.deletedAt IS NULL');
  if (params.q) {
    const like = `%${params.q}%`;
    qb.andWhere(
      new typeorm_1.Brackets((w) => {
        w.where('u.email LIKE :like', { like }).orWhere('u.displayName LIKE :like', { like });
      }),
    );
  }
  if (params.cursor) {
    const c = decodeCursor(params.cursor);
    if (c) {
      qb.andWhere(
        new typeorm_1.Brackets((w) => {
          w.where('u.createdAt < :cAt', { cAt: c.createdAt }).orWhere(
            new typeorm_1.Brackets((w2) => {
              w2.where('u.createdAt = :cAt', { cAt: c.createdAt }).andWhere('u.id < :cid', {
                cid: c.id,
              });
            }),
          );
        }),
      );
    }
  } else if (params.page && params.page > 1) {
    qb.skip((params.page - 1) * limit); // offset fallback
  }
  const rows = await qb.getMany();
  const items = rows.slice(0, limit);
  const nextCursor =
    rows.length > limit
      ? encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
      : null;
  return { items, nextCursor, hasNext: !!nextCursor };
}
async function getUserById(id, withDeleted = false) {
  return (0, exports.usersRepo)().findOne({
    where: { id },
    withDeleted,
    select: ['id', 'email', 'displayName', 'role', 'createdAt', 'updatedAt', 'deletedAt'],
  });
}
async function softDeleteUser(id) {
  // softRemove требует загрузить сущность
  const repo = (0, exports.usersRepo)();
  const u = await repo.findOne({ where: { id } });
  if (!u) return false;
  await repo.softRemove(u);
  return true;
}
async function hardDeleteUser(id) {
  const res = await (0, exports.usersRepo)().delete(id);
  return res.affected && res.affected > 0;
}
//# sourceMappingURL=users.service.js.map
