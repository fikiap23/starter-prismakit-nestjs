import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CacheAdapter } from '@prismakit/core';
import { RedisCacheAdapter } from '@prismakit/redis';

@Injectable()
export class RedisService implements OnModuleDestroy, CacheAdapter {
  private readonly adapter: RedisCacheAdapter;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('redis.url');
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const prefix = this.configService.get<string>('redis.prefix', 'starter');

    this.adapter = new RedisCacheAdapter({
      ...(url ? { url } : { host, port }),
      prefix,
      compression: 'gzip',
    });
  }

  async onModuleDestroy() {
    await this.adapter.disconnect();
  }

  isReady(): boolean {
    return this.adapter.isReady();
  }

  getPrefix(): string {
    return this.adapter.getPrefix();
  }

  get<T>(key: string): Promise<T | null> {
    return this.adapter.get<T>(key);
  }

  set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    return this.adapter.set(key, value, ttlSeconds);
  }

  del(...keys: string[]): Promise<void> {
    return this.adapter.del(...keys);
  }

  setNx(key: string, ttlSeconds: number): Promise<boolean> {
    return this.adapter.setNx(key, ttlSeconds);
  }

  setWithIndex(
    key: string,
    value: unknown,
    ttlSeconds: number,
    indexKey: string,
  ): Promise<void> {
    return this.adapter.setWithIndex(key, value, ttlSeconds, indexKey);
  }

  invalidateByIndex(indexKey: string): Promise<void> {
    return this.adapter.invalidateByIndex(indexKey);
  }

  saddAndExpire(
    key: string,
    members: string[],
    ttlSeconds: number,
  ): Promise<void> {
    return this.adapter.saddAndExpire(key, members, ttlSeconds);
  }

  smembers(key: string): Promise<string[]> {
    return this.adapter.smembers(key);
  }

  safeGet<T>(key: string): Promise<T | null> {
    return this.adapter.safeGet<T>(key);
  }

  safeSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    return this.adapter.safeSet(key, value, ttlSeconds);
  }

  safeDel(...keys: string[]): Promise<void> {
    return this.adapter.safeDel(...keys);
  }

  safeSetNx(key: string, ttlSeconds: number): Promise<boolean> {
    return this.adapter.safeSetNx(key, ttlSeconds);
  }

  safeSetWithIndex(
    key: string,
    value: unknown,
    ttlSeconds: number,
    indexKey: string,
  ): Promise<void> {
    return this.adapter.safeSetWithIndex(key, value, ttlSeconds, indexKey);
  }

  safeInvalidateByIndex(indexKey: string): Promise<void> {
    return this.adapter.safeInvalidateByIndex(indexKey);
  }

  safeSaddAndExpire(
    key: string,
    members: string[],
    ttlSeconds: number,
  ): Promise<void> {
    return this.adapter.safeSaddAndExpire(key, members, ttlSeconds);
  }

  safeSmembers(key: string): Promise<string[]> {
    return this.adapter.safeSmembers(key);
  }
}
