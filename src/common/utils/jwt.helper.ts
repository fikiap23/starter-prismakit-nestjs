import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtAccessClaims } from 'src/shared/interfaces/auth.interface';

@Injectable()
export class JwtHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signToken(payload: IJwtAccessClaims, expiresIn = '7d') {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      secret: this.configService.get<string>('app.jwtSecret'),
    });
    return { access_token };
  }
}
