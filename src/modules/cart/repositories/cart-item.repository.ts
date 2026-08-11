import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const CartItemRepository = defineAppRepo({
  model: 'cartItem',
  scalarFields: Prisma.CartItemScalarFieldEnum,
  // Composite @@id — runtime accepts string[]; Nest TypeMap options type is string.
  primaryKey: ['userId', 'productId'] as unknown as string,
  cache: { ttl: 300 },
});
export type CartItemRepository = AppRepo<'CartItem', true>;
