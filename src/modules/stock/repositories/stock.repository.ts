import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class StockRepository extends defineAppRepo({
  model: 'stock',
  scalarFields: Prisma.StockScalarFieldEnum,
  cache: { ttl: 60 },
  lock: true,
}) {}
