import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class OrderRepository extends defineAppRepo({
  model: 'order',
  cache: { ttl: 300 },
}) {}
