import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { getUserSelect } from 'src/modules/user/types/select-user.type';
import {
  IJwtAccessClaims,
  IPayloadJWT,
} from 'src/shared/interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userRepository: UserRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('app.jwtSecret'),
    });
  }

  async validate(payload: IJwtAccessClaims): Promise<IPayloadJWT | false> {
    const user = await this.userRepository.getFirst({
      where: { id: payload.sub },
      select: getUserSelect('minimal'),
    });
    if (!user || user.status !== 'ACTIVE') return false;
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    };
  }
}
