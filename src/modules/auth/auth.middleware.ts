import type { Request, Response, NextFunction } from 'express';
import { verifyAccess } from './auth.service';
import { HttpError } from '../../middlewares/error';

export type AuthUser = {
  id: string;
  role: 'user' | 'admin';
  email: string;
  displayName: string;
} | null;

declare global {
  namespace Express {
    // Добавим тип в Request
    interface Request {
      user: AuthUser;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  req.user = null;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email, displayName: payload.displayName };
  } catch {
    // игнорируем — просто нет пользователя
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Unauthorized');
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email, displayName: payload.displayName };
    next();
  } catch {
    throw new HttpError(401, 'Unauthorized');
  }
}

export function requireRole(roles: Array<'user' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, 'Unauthorized');
    if (!roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');
    next();
  };
}
