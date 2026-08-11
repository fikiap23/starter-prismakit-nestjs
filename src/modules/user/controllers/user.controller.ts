import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import { IPayloadJWT } from 'src/shared/interfaces/auth.interface';
import { UserService } from '../services/user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get('me')
  @SwaggerEndpoint({ summary: 'Current user + profile (composed, cached)' })
  async me(@CurrentUser() user: IPayloadJWT, @Res() res: Response) {
    try {
      const data = await this.users.handleMe(user.sub);
      return formatResponse(res, HttpStatus.OK, data);
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
