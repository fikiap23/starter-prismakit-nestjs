import { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const cartItemSelectPresets = {
  general: {
    userId: true,
    productId: true,
    qty: true,
    product: { select: { id: true, name: true, sku: true, priceCents: true } },
  } satisfies Prisma.CartItemSelect,
};

export function getCartItemSelect() {
  return cartItemSelectPresets.general;
}
