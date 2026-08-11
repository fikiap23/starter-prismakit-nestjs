import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

/**
 * Compose-only (Product.images). Prefer autoRegisterModels at runtime;
 * this file lets `prismakit validate --auto-register` resolve the relation.
 */
export const ProductImageRepository = defineAppRepo({
  model: 'productImage',
  scalarFields: Prisma.ProductImageScalarFieldEnum,
});
export interface ProductImageRepository extends InstanceType<
  typeof ProductImageRepository
> {}
