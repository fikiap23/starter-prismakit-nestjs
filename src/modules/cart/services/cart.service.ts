import { Injectable } from '@nestjs/common';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { getCartItemSelect } from '../types/select-cart-item.type';
import { UpsertCartItemDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly cartItems: CartItemRepository) {}

  handleUpsertItem(userId: string, dto: UpsertCartItemDto) {
    return this.cartItems.upsert({
      where: {
        userId_productId: { userId, productId: dto.productId },
      },
      create: { userId, productId: dto.productId, qty: dto.qty },
      update: { qty: dto.qty },
      select: getCartItemSelect(),
    });
  }

  handleClear(userId: string) {
    return this.cartItems.deleteMany({ where: { userId } });
  }

  handleGetMany(userId: string) {
    return this.cartItems.getMany({
      where: { userId },
      select: getCartItemSelect(),
      setCache: true,
    });
  }
}
