import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repositories/coupon.repository';
import { getCouponSelect } from '../types/select-coupon.type';
import { UpsertCouponDto } from '../dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly coupons: CouponRepository) {}

  handleUpsertByCode(code: string, dto: UpsertCouponDto) {
    const normalized = code.trim().toUpperCase();
    return this.coupons.upsert({
      where: { code: normalized },
      create: {
        code: normalized,
        type: dto.type,
        amount: dto.amount,
        isActive: dto.isActive ?? true,
      },
      update: {
        type: dto.type,
        amount: dto.amount,
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: getCouponSelect('general'),
    });
  }
}
