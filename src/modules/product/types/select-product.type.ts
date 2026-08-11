import { Prisma } from 'src/infrastructure/prisma/prisma-client';

type Key = keyof typeof productSelectPresets;

export function getProductSelect<K extends Key>(key: K) {
  return productSelectPresets[key];
}

export const productSelectPresets = {
  minimal: {
    id: true,
    sku: true,
    categoryId: true,
    isActive: true,
  } satisfies Prisma.ProductSelect,
  general: {
    id: true,
    sku: true,
    name: true,
    description: true,
    priceCents: true,
    isActive: true,
    categoryId: true,
    category: { select: { name: true, slug: true } },
    images: {
      select: {
        id: true,
        alt: true,
        sortOrder: true,
        fileAsset: { select: { id: true, storageKey: true, status: true } },
      },
    },
    stock: { select: { id: true, qty: true } },
  } satisfies Prisma.ProductSelect,
};
