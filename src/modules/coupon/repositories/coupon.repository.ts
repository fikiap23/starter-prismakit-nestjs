import { defineAppRepo } from 'src/infrastructure/prisma/define-app-repo';

export class CouponRepository extends defineAppRepo({
  model: 'coupon',
  cache: true,
}) {}
