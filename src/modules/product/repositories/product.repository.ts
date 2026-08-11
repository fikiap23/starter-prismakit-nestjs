import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { DAY, HOUR } from 'src/common/constants';

export class ProductRepository extends defineAppRepo({
  model: 'product',
  scalarFields: Prisma.ProductScalarFieldEnum,
  cache: {
    ttl: HOUR,
    defaultSetCache: true,
    nullTtl: 60,
    methods: {
      getManyPaginate: { ttl: 60 },
      getMany: { ttl: 60 },
    },
    stampede: {
      lockTtl: 5,
      retryMs: 100,
      maxRetries: 10,
      backoff: 'exponential',
      totalTimeoutMs: 3000,
    },
  },
}) {}
