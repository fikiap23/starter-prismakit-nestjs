import { createDefineRepo } from '@prismakit/nestjs';
import type { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { DAY } from 'src/common/constants';

/**
 * App-wide repository factory. `model` is typed from Prisma.TypeMap.meta.modelProps.
 * Pass `cache: true` to use these defaults; omit `cache` for uncached repos.
 */
export const defineAppRepo = createDefineRepo<Prisma.TypeMap>({
  cache: {
    ttl: DAY,
    nullTtl: 60,
    defaultSetCache: true,
  },
});
