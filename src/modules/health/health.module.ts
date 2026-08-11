import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { HealthCheckRepository } from './repositories/health-check.repository';
import { HealthService } from './services/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthCheckRepository],
})
export class HealthModule {}
