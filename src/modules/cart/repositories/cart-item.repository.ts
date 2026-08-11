import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class CartItemRepository extends defineAppRepo({
  model: 'cartItem',
  scalarFields: Prisma.CartItemScalarFieldEnum,
  cache: { ttl: 300 },
}) {}
