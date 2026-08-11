import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

export const ProductTagRepository = defineAppRepo({
  model: 'productTag',
  scalarFields: Prisma.ProductTagScalarFieldEnum,
  primaryKey: ['productId', 'tagId'] as unknown as string,
  cache: { ttl: 3600 },
});
export type ProductTagRepository = AppRepo<'ProductTag', true>;
