import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class StockRepository extends defineAppRepo({
  model: 'stock',
  cache: { ttl: 60 },
  lock: true,
}) {}
