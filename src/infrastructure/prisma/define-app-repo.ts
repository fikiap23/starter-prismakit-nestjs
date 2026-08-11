import type { InvalidateMode } from '@prismakit/core';
import {
  createDefineRepo,
  type RepositoryApiFromTypeMap,
} from '@prismakit/nestjs';
import type { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const defineAppRepo = createDefineRepo<Prisma.TypeMap>();

type TxClient = { [key: string]: unknown };

type CacheMutation<TCache extends boolean> = TCache extends true
  ? {
      invalidate?: InvalidateMode;
      tags?: string[] | ((result: unknown) => string[] | null | undefined);
    }
  : object;

/**
 * PrismaKit 2.2.3 TypeMap API omits bulk ops / lock-on-getFirst in the public
 * types even though runtime `createRepository` implements them. Intersect so
 * checkout, cart, coupon, and tags type-check.
 */
type BulkAndLockApi<TCache extends boolean> = {
  createMany(
    args: {
      tx?: TxClient;
      data: unknown[];
      skipDuplicates?: boolean;
    } & CacheMutation<TCache>,
  ): Promise<{ count: number }>;
  updateMany(
    args: {
      tx?: TxClient;
      where: unknown;
      data: unknown;
    } & CacheMutation<TCache>,
  ): Promise<{ count: number }>;
  upsert<T = unknown>(
    args: {
      tx?: TxClient;
      where: unknown;
      create: unknown;
      update: unknown;
      select?: T;
    } & CacheMutation<TCache>,
  ): Promise<T extends object ? unknown : unknown>;
  deleteMany(
    args: {
      tx?: TxClient;
      where: unknown;
    } & CacheMutation<TCache>,
  ): Promise<{ count: number }>;
};

export type AppRepo<
  M extends keyof Prisma.TypeMap['model'],
  TCache extends boolean = false,
> = RepositoryApiFromTypeMap<Prisma.TypeMap, M, TCache> &
  BulkAndLockApi<TCache>;
