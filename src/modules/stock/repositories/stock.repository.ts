import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const StockRepository = defineAppRepo({
  model: 'stock',
  scalarFields: Prisma.StockScalarFieldEnum,
  cache: { ttl: 60 },
  lock: true,
});
export interface StockRepository extends InstanceType<typeof StockRepository> {}
