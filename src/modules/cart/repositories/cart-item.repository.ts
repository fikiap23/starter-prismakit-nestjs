import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const CartItemRepository = defineAppRepo({
  model: 'cartItem',
  scalarFields: Prisma.CartItemScalarFieldEnum,
  cache: { ttl: 300 },
});
export interface CartItemRepository extends InstanceType<
  typeof CartItemRepository
> {}
