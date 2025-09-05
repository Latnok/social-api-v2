import jwt, { SignOptions } from 'jsonwebtoken';
import argon2 from 'argon2';
import { AppDataSource } from '../../db/data-source';
import { User } from '../../db/entities/user.entity';
import type { JwtPayload } from './auth.types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES ?? '15m') as string | number;
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES ?? '7d') as string | number;

const accessOpts: SignOptions = { expiresIn: ACCESS_EXPIRES };
const refreshOpts: SignOptions = { expiresIn: REFRESH_EXPIRES };

export async function hashPassword(plain: string) {
  return argon2.hash(plain, { type: argon2.argon2id });
}
export async function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain);
}

export function signAccessToken(user: User) {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    displayName: user.displayName,
    typ: 'access',
  };
  return jwt.sign(payload, ACCESS_SECRET, accessOpts);
}
export function signRefreshToken(user: User) {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    displayName: user.displayName,
    typ: 'refresh',
  };
  return jwt.sign(payload, REFRESH_SECRET, refreshOpts);
}

export function verifyAccess(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export async function getUserWithPasswordByEmail(email: string) {
  const repo = AppDataSource.getRepository(User);
  return repo
    .createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email })
    .getOne();
}
