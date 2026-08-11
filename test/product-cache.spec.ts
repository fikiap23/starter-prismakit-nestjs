import { createRepository } from '@prismakit/core';
import { MemoryCacheAdapter } from '@prismakit/memory';

const ProductScalarFieldEnum = {
  id: 'id',
  sku: 'sku',
  name: 'name',
  priceCents: 'priceCents',
  categoryId: 'categoryId',
  isActive: 'isActive',
} as const;

function createFakePrisma(store: { row: Record<string, unknown> | null; finds: number }) {
  return {
    product: {
      findUnique: async ({
        where,
        select,
      }: {
        where: { id: string };
        select?: Record<string, boolean>;
      }) => {
        store.finds += 1;
        if (!store.row || store.row.id !== where.id) return null;
        if (!select) return { ...store.row };
        const projected: Record<string, unknown> = {};
        for (const [key, enabled] of Object.entries(select)) {
          if (enabled) projected[key] = store.row[key];
        }
        return projected;
      },
    },
  };
}

describe('Product cache hit/miss (MemoryCacheAdapter)', () => {
  it('misses then hits on the second getById', async () => {
    const cache = new MemoryCacheAdapter({ prefix: 'starter-test' });
    const store = {
      row: {
        id: 'p1',
        sku: 'KB-01',
        name: 'Keyboard',
        priceCents: 12900,
        categoryId: 'c1',
        isActive: true,
      },
      finds: 0,
    };
    const ProductRepo = createRepository({
      model: 'product',
      scalarFields: ProductScalarFieldEnum,
      cache: { ttl: 60, defaultSetCache: true },
    });
    const products = new ProductRepo({
      prisma: createFakePrisma(store),
      cache,
    });

    const first = await products.getById({
      id: 'p1',
      select: { id: true, name: true, sku: true },
      setCache: true,
    });
    const second = await products.getById({
      id: 'p1',
      select: { id: true, name: true, sku: true },
      setCache: true,
    });

    expect(first).toEqual({ id: 'p1', name: 'Keyboard', sku: 'KB-01' });
    expect(second).toEqual(first);
    expect(store.finds).toBe(1);
  });
});
