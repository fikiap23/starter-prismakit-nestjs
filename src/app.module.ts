import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { PrismaClientLike } from '@prismakit/nestjs';
import { PrismaKitModule } from '@prismakit/nestjs';
import { CacheDebugInterceptor } from './common/interceptors/cache-debug.interceptor';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { CommonModule } from './common/common.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import { validate } from './config/env.validation';
import { PrismaClientModule } from './infrastructure/prisma/prisma-client.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RedisService } from './infrastructure/redis/redis.service';
import { StorageModule } from './infrastructure/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { FileAssetModule } from './modules/file-asset/file-asset.module';
import { HealthModule } from './modules/health/health.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { StockModule } from './modules/stock/stock.module';
import { UserModule } from './modules/user/user.module';

const prismakitLogger = new Logger('PrismaKit');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'build/.env'],
      load: [databaseConfig, appConfig, redisConfig, storageConfig],
      validate,
    }),
    CommonModule,
    PrismaClientModule,
    RedisModule,
    PrismaKitModule.forRootAsync({
      imports: [PrismaClientModule, RedisModule],
      inject: [PrismaService, RedisService],
      useFactory: (...args: unknown[]) => {
        const prisma = args[0] as PrismaService;
        const redis = args[1] as RedisService;
        return {
          prisma: prisma as unknown as PrismaClientLike,
          cache: redis,
          validateCompose: false,
          autoRegisterModels: true,
          compose: {
            maxDepth: 6,
            parallel: true,
            setCache: true,
          },
          queryLog: {
            slowThreshold: 500,
            onSlowQuery: (event) => {
              prismakitLogger.warn(
                `slow ${event.model}.${event.method}: ${event.durationMs}ms`,
              );
            },
          },
          telemetry: {
            enabled: true,
            onEvent: (event) => {
              if (event.type === 'query.complete') return;
              const method = 'method' in event ? event.method : undefined;
              prismakitLogger.debug(
                `${event.type} ${event.model ?? ''} ${method ?? ''}`.trim(),
              );
            },
          },
        };
      },
    }),
    StorageModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    CartModule,
    StockModule,
    CouponModule,
    OrderModule,
    FileAssetModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheDebugInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
