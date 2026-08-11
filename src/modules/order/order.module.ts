import { Module } from '@nestjs/common';
import { CartModule } from 'src/modules/cart/cart.module';
import { CouponModule } from 'src/modules/coupon/coupon.module';
import { StockModule } from 'src/modules/stock/stock.module';
import { OrderController } from './controllers/order.controller';
import { CheckoutHelper } from './helpers/checkout.helper';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';

@Module({
  imports: [CartModule, StockModule, CouponModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    CheckoutHelper,
    OrderRepository,
    OrderItemRepository,
    AuditLogRepository,
  ],
})
export class OrderModule {}
