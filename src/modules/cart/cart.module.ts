import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartItemRepository } from './repositories/cart-item.repository';
import { CartService } from './services/cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CartItemRepository],
  exports: [CartItemRepository],
})
export class CartModule {}
