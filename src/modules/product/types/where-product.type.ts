import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { FilterProductDto } from '../dto/product.dto';

export function whereProductGetManyPaginate(filter: FilterProductDto) {
  const where: Prisma.ProductWhereInput = {
    ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
    ...(filter.q
      ? {
          OR: [
            { name: { contains: filter.q, mode: 'insensitive' } },
            { sku: { contains: filter.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  return { where };
}
