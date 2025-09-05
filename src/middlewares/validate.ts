import type { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpError } from './error';

type Ctor<T> = { new (...args: any[]): T };

export function validateBody<T>(Dto: Ctor<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const inst = plainToInstance(Dto, req.body, { enableImplicitConversion: true });
    const errors = await validate(inst as object, {
      whitelist: true,            // выбрасываем посторонние поля
      forbidNonWhitelisted: true, // ошибка, если пришло лишнее
    });

    if (errors.length) {
      const details = errors.map((e) => ({
        field: e.property,
        constraints: e.constraints ?? {},
      }));
      return next(new HttpError(400, 'Validation failed', 'VALIDATION_ERROR', details));
    }
    req.body = inst as any;
    next();
  };
}
