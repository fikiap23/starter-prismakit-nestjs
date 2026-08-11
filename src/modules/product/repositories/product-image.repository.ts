import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

/**
 * Compose-only (Product.images). File exists so `prismakit validate --auto-register`
 * can resolve the relation; Nest auto-registers at runtime if unused.
 */
export class ProductImageRepository extends defineAppRepo({
  model: 'productImage',
  scalarFields: Prisma.ProductImageScalarFieldEnum,
}) {}
