import { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const stockSelectPresets = {
  lock: { id: true, productId: true, qty: true } satisfies Prisma.StockSelect,
};

export function getStockLockSelect() {
  return stockSelectPresets.lock;
}
