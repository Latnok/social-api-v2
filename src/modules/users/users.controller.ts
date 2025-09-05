import type { Request, Response } from 'express';
import { HttpError } from '../../middlewares/error';
import { getUserById, hardDeleteUser, listUsers, softDeleteUser } from './users.service';

export async function getUsers(req: Request, res: Response) {
  const { limit, page, cursor, q, withDeleted } = req.query as Record<string, string | undefined>;

  const parsed = {
    limit: limit ? Number(limit) : undefined,
    page: page ? Number(page) : undefined,
    cursor: cursor ?? null,
    q: q ?? null,
    withDeleted: withDeleted === 'true',
  };

  const result = await listUsers(parsed);
  res.json(result);
}

export async function getUser(req: Request, res: Response) {
  const user = await getUserById(req.params.id, req.query.withDeleted === 'true');
  if (!user) throw new HttpError(404, 'User not found');
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const hard = req.query.hard === 'true';
  const ok = hard ? await hardDeleteUser(req.params.id) : await softDeleteUser(req.params.id);
  if (!ok) throw new HttpError(404, 'User not found');
  res.status(204).send();
}
