import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const OrderRepository = defineAppRepo({
  model: 'order',
  scalarFields: Prisma.OrderScalarFieldEnum,
  cache: { ttl: 300 },
});
export type OrderRepository = AppRepo<'Order', true>;
