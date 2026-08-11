import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { IPayloadJWT } from 'src/shared/interfaces/auth.interface';

export class JwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = IPayloadJWT>(
    err: unknown,
    user: TUser | false,
    info: unknown,
    _context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const infoName =
        info && typeof info === 'object' && 'name' in info
          ? String((info as { name?: unknown }).name)
          : undefined;
      const code =
        infoName === 'TokenExpiredError'
          ? EErrorCode.AUTH_TOKEN_EXPIRED
          : EErrorCode.AUTH_TOKEN_INVALID;
      throw new CustomError({
        statusCode: 401,
        message: 'Authentication required',
        code,
      });
    }
    return user;
  }
}
