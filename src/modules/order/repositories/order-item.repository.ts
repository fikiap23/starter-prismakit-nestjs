import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const OrderItemRepository = defineAppRepo({
  model: 'orderItem',
  scalarFields: Prisma.OrderItemScalarFieldEnum,
});
export interface OrderItemRepository extends InstanceType<
  typeof OrderItemRepository
> {}
