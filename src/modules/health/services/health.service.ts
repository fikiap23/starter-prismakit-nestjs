import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { HealthCheckRepository } from '../repositories/health-check.repository';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheck: HealthCheckRepository,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
  ) {}

  handleLive() {
    return { status: 'UP' as const };
  }

  async handleReady() {
    const [databaseOk, storageOk] = await Promise.all([
      this.healthCheck.pingDatabase(),
      this.storage.isHealthy(),
    ]);
    const redisOk = this.redis.isReady();
    const checks = {
      database: databaseOk ? ('UP' as const) : ('DOWN' as const),
      objectStorage: storageOk ? ('UP' as const) : ('DOWN' as const),
      redis: redisOk ? ('UP' as const) : ('DOWN' as const),
    };
    const allUp = databaseOk && storageOk && redisOk;
    return {
      ready: allUp,
      body: {
        status: allUp ? ('UP' as const) : ('DOWN' as const),
        checks,
      },
    };
  }

  handleVersion() {
    try {
      const pkg = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
      ) as { version?: string };
      return { version: pkg.version ?? '0.0.0' };
    } catch {
      return { version: '0.0.0' };
    }
  }
}
