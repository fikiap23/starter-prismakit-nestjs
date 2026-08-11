import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export const ProductTagRepository = defineAppRepo({
  model: 'productTag',
  scalarFields: Prisma.ProductTagScalarFieldEnum,
  cache: { ttl: 3600 },
});
export interface ProductTagRepository extends InstanceType<
  typeof ProductTagRepository
> {}
