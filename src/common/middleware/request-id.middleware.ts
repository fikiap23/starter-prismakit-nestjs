import { randomUUID } from 'crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const id = req.headers['x-request-id'] as string | undefined;
    req.requestId = id && id.length <= 64 ? id : randomUUID();
    _res.setHeader('X-Request-Id', req.requestId);
    next();
  }
}
