import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class OrderItemRepository extends defineAppRepo({
  model: 'orderItem',
}) {}
