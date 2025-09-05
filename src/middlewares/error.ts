import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl, code: 'NOT_FOUND' });
};

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any)?.status ?? 500;
  const message = (err as any)?.message ?? 'Internal Server Error';
  const code = (err as any)?.code;

  logger.error({ err, path: req.originalUrl, method: req.method, status }, 'Unhandled error');

  res.status(status).json({
    error: message,
    ...(code && { code }),
    ...((err as any)?.details ? { details: (err as any).details } : {}),
    ...(process.env.NODE_ENV !== 'production' && { stack: (err as any)?.stack }),
  });
};
