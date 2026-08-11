import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import { LoginDto, RegisterDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @SwaggerEndpoint({
    summary: 'Login (never caches password select)',
    auth: false,
    body: LoginDto,
  })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const data = await this.auth.handleLogin(dto);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Post('register')
  @SwaggerEndpoint({
    summary: 'Register',
    auth: false,
    body: RegisterDto,
    success: { status: 201 },
  })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    try {
      const data = await this.auth.handleRegister(dto);
      return formatResponse(res, HttpStatus.CREATED, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
