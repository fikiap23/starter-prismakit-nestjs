import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class CartItemRepository extends defineAppRepo({
  model: 'cartItem',
  cache: { ttl: 300 },
}) {}
