import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';

/**
 * Compose-only (Product.images). Prefer autoRegisterModels at runtime;
 * this file lets `validate:compose` resolve the relation.
 */
export const ProductImageRepository = defineAppRepo({
  model: 'productImage',
  scalarFields: Prisma.ProductImageScalarFieldEnum,
});
export type ProductImageRepository = AppRepo<'ProductImage'>;
