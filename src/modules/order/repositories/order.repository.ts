import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class OrderRepository extends defineAppRepo({
  model: 'order',
  scalarFields: Prisma.OrderScalarFieldEnum,
  cache: { ttl: 300 },
}) {}
