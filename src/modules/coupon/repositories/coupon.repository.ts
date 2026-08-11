import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import {
  defineAppRepo,
  type AppRepo,
} from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

export const CouponRepository = defineAppRepo({
  model: 'coupon',
  scalarFields: Prisma.CouponScalarFieldEnum,
  cache: { ttl: DAY },
});
export type CouponRepository = AppRepo<'Coupon', true>;
