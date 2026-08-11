import { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const orderSelectPresets = {
  general: {
    id: true,
    userId: true,
    status: true,
    totalCents: true,
    createdAt: true,
    items: {
      select: {
        id: true,
        qty: true,
        priceCents: true,
        product: { select: { name: true, sku: true } },
      },
    },
  } satisfies Prisma.OrderSelect,
};

export function getOrderSelect() {
  return orderSelectPresets.general;
}
