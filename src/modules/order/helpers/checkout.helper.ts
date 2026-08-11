import { Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { CouponType } from 'src/infrastructure/prisma/prisma-client';
import { CartItemRepository } from 'src/modules/cart/repositories/cart-item.repository';
import { getCartItemSelect } from 'src/modules/cart/types/select-cart-item.type';
import { CouponRepository } from 'src/modules/coupon/repositories/coupon.repository';
import { getCouponSelect } from 'src/modules/coupon/types/select-coupon.type';

@Injectable()
export class CheckoutHelper {
  constructor(
    private readonly cartItems: CartItemRepository,
    private readonly coupons: CouponRepository,
  ) {}

  async loadCart(userId: string) {
    const items = await this.cartItems.getMany({
      where: { userId },
      select: getCartItemSelect(),
      setCache: false,
    });
    if (items.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: 'Cart is empty',
        code: EErrorCode.WORKFLOW_INVALID_STATE,
      });
    }
    return items;
  }

  async resolveCoupon(code?: string) {
    if (!code) return null;
    const coupon = await this.coupons.getFirst({
      where: { code: code.trim().toUpperCase(), isActive: true },
      select: getCouponSelect('general'),
      setCache: false,
    });
    if (!coupon) {
      throw new CustomError({
        statusCode: 404,
        message: 'Coupon not found',
        code: EErrorCode.RESOURCE_NOT_FOUND,
      });
    }
    return coupon;
  }

  subtotalCents(
    items: Array<{ qty: number; product: { priceCents: number } }>,
  ) {
    return items.reduce(
      (sum, item) => sum + item.qty * item.product.priceCents,
      0,
    );
  }

  applyCoupon(
    subtotal: number,
    coupon: { type: CouponType; amount: number } | null,
  ) {
    if (!coupon) return subtotal;
    if (coupon.type === CouponType.PERCENT) {
      return Math.max(0, Math.round(subtotal * (1 - coupon.amount / 100)));
    }
    return Math.max(0, subtotal - coupon.amount);
  }
}
