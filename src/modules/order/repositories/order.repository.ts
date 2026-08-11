import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const OrderRepository = defineAppRepo({
  model: 'order',
  scalarFields: Prisma.OrderScalarFieldEnum,
  cache: { ttl: 300 },
});
export interface OrderRepository extends InstanceType<typeof OrderRepository> {}
