import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerEndpoint } from 'src/common/decorators/swagger-endpoint.decorator';
import { formatResponse } from 'src/common/utils/http.helper';
import { errorHandler } from 'src/common/utils/validation.helper';
import { HealthService } from '../services/health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('health')
  @SwaggerEndpoint({
    summary: 'Liveness alias for compose healthcheck',
    auth: false,
  })
  async healthAlias(@Res() res: Response) {
    try {
      return formatResponse(res, HttpStatus.OK, this.health.handleLive());
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Get('health/live')
  @SwaggerEndpoint({ summary: 'Liveness probe', auth: false })
  async live(@Res() res: Response) {
    try {
      return formatResponse(res, HttpStatus.OK, this.health.handleLive());
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Get('health/ready')
  @SwaggerEndpoint({ summary: 'Readiness probe', auth: false })
  async ready(@Res() res: Response) {
    try {
      const result = await this.health.handleReady();
      const status = result.ready
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;
      return formatResponse(res, status, result.body);
    } catch (error) {
      return errorHandler(res, error);
    }
  }

  @Get('version')
  @SwaggerEndpoint({ summary: 'Build version', auth: false })
  async version(@Res() res: Response) {
    try {
      return formatResponse(res, HttpStatus.OK, this.health.handleVersion());
    } catch (error) {
      return errorHandler(res, error);
    }
  }
}
