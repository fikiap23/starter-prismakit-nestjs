import { Injectable } from '@nestjs/common';
import { AuthAuthenticateHelper } from '../helpers/auth-authenticate.helper';
import { LoginDto, RegisterDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly auth: AuthAuthenticateHelper) {}

  handleLogin(dto: LoginDto) {
    return this.auth.login(dto);
  }

  handleRegister(dto: RegisterDto) {
    return this.auth.register(dto);
  }
}
