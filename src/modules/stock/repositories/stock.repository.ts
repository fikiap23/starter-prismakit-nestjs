import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const StockRepository = defineAppRepo({
  model: 'stock',
  scalarFields: Prisma.StockScalarFieldEnum,
  cache: { ttl: 60 },
  lock: true,
});
export type StockRepository = AppRepo<'Stock', true>;
