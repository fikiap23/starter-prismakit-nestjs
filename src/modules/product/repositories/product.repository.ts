import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';
import { DAY, HOUR } from 'src/common/constants';

export const ProductRepository = defineAppRepo({
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
});
export type ProductRepository = AppRepo<'Product', true>;
