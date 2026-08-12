import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { HOUR } from 'src/common/constants';

export class ProductRepository extends defineAppRepo({
  model: 'product',
  cache: {
    ttl: HOUR,
    methods: {
      getManyPaginate: { ttl: 60 },
      getMany: { ttl: 60 },
      getManyCursor: { ttl: 60 },
      count: { ttl: 60 },
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
