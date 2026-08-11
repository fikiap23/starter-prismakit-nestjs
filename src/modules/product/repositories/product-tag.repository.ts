import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class ProductTagRepository extends defineAppRepo({
  model: 'productTag',
  scalarFields: Prisma.ProductTagScalarFieldEnum,
  cache: { ttl: 3600 },
}) {}
