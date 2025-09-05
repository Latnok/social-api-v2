import type { Request, Response } from 'express';
import { HttpError } from '../../middlewares/error';
import { createUser } from '../users/users.service';
import {
  getUserWithPasswordByEmail,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefresh,
} from './auth.service';

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? 'rt';
const REFRESH_COOKIE_DOMAIN = process.env.REFRESH_COOKIE_DOMAIN || undefined;
const isProd = process.env.NODE_ENV === 'production';

const sameSite = (process.env.REFRESH_COOKIE_SAMESITE as any) ?? 'lax';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: sameSite,        // 'lax'|'strict'|'none'
    secure: isProd || sameSite === 'none', // для SameSite=None обязателен secure
    domain: REFRESH_COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body as {
    email?: string; password?: string; displayName?: string;
  };

  if (!email || !password || !displayName) {
    throw new HttpError(400, 'email, password, displayName are required');
  }

  // Юзер уже есть?
  const existing = await getUserWithPasswordByEmail(email);
  if (existing) throw new HttpError(409, 'User with this email already exists');

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, displayName, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    accessToken,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) throw new HttpError(400, 'email and password are required');

  const user = await getUserWithPasswordByEmail(email);
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    accessToken,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const token = (req.cookies?.[REFRESH_COOKIE_NAME] ?? '') as string;
  if (!token) throw new HttpError(401, 'No refresh token');

  let payload: any;
  try {
    payload = verifyRefresh(token);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  // минимальный stateless refresh — берём данные из payload
  const user = {
    id: payload.sub as string,
    email: payload.email as string,
    displayName: payload.displayName as string,
    role: payload.role as 'user' | 'admin',
  };

  const accessToken = signAccessToken(user as any);
  const refreshToken = signRefreshToken(user as any);
  setRefreshCookie(res, refreshToken);

  res.json({ accessToken });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    domain: REFRESH_COOKIE_DOMAIN,
    path: '/api/auth',
  });
  res.status(204).send();
};
