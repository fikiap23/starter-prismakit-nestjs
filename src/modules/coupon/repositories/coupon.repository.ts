import { Prisma } from 'src/infrastructure/prisma/prisma-client';
import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';
import { DAY } from 'src/common/constants';

export class CouponRepository extends defineAppRepo({
  model: 'coupon',
  scalarFields: Prisma.CouponScalarFieldEnum,
  cache: { ttl: DAY },
}) {}
