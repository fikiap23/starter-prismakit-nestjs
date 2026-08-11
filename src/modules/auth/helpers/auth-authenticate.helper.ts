import { Injectable } from '@nestjs/common';

import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { compareBcrypt, hashBcrypt } from 'src/common/utils/bcrypt.util';
import { JwtHelper } from 'src/common/utils/jwt.helper';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { getUserSelect } from 'src/modules/user/types/select-user.type';
import { LoginDto, RegisterDto } from '../dto/login.dto';

@Injectable()
export class AuthAuthenticateHelper {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtHelper: JwtHelper,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.getFirst({
      where: { email: dto.email },
      select: getUserSelect('withPassword'),
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new CustomError({
        statusCode: 401,
        message: 'Invalid credentials',
        code: EErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }
    const ok = await compareBcrypt(dto.password, user.password);
    if (!ok) {
      throw new CustomError({
        statusCode: 401,
        message: 'Invalid credentials',
        code: EErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }
    return this.jwtHelper.signToken({ sub: user.id, email: user.email });
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.getFirst({
      where: { email: dto.email },
      select: getUserSelect('minimal'),
    });
    if (existing) {
      throw new CustomError({
        statusCode: 409,
        message: 'Email already registered',
        code: EErrorCode.DUPLICATE_RESOURCE,
      });
    }
    const password = await hashBcrypt(dto.password);
    const user = await this.users.create({
      data: {
        email: dto.email,
        name: dto.name,
        password,
        profile: { create: {} },
      },
      select: getUserSelect('general'),
    });
    const token = await this.jwtHelper.signToken({
      sub: user.id,
      email: user.email,
    });
    return { user, ...token };
  }
}
