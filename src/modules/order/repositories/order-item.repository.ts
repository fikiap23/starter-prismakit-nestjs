import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const OrderItemRepository = defineAppRepo({
  model: 'orderItem',
  scalarFields: Prisma.OrderItemScalarFieldEnum,
});
export type OrderItemRepository = AppRepo<'OrderItem'>;
