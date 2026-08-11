import { Prisma } from 'src/infrastructure/prisma/prisma-client';

export const couponSelectPresets = {
  minimal: {
    id: true,
    code: true,
    isActive: true,
  } satisfies Prisma.CouponSelect,
  general: {
    id: true,
    code: true,
    type: true,
    amount: true,
    isActive: true,
  } satisfies Prisma.CouponSelect,
};

export function getCouponSelect<K extends keyof typeof couponSelectPresets>(
  key: K,
) {
  return couponSelectPresets[key];
}
