import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class ProductTagRepository extends defineAppRepo({
  model: 'productTag',
  cache: { ttl: 3600 },
}) {}
