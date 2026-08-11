import { Injectable } from '@nestjs/common';
import { TransactionService } from '@prismakit/nestjs';
import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { CartItemRepository } from 'src/modules/cart/repositories/cart-item.repository';
import { StockRepository } from 'src/modules/stock/repositories/stock.repository';
import { getStockLockSelect } from 'src/modules/stock/types/select-stock.type';
import { CheckoutDto } from '../dto/checkout.dto';
import { CheckoutHelper } from '../helpers/checkout.helper';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderRepository } from '../repositories/order.repository';
import { getOrderSelect } from '../types/select-order.type';

@Injectable()
export class OrderService {
  constructor(
    private readonly tx: TransactionService,
    private readonly checkout: CheckoutHelper,
    private readonly cartItems: CartItemRepository,
    private readonly stocks: StockRepository,
    private readonly orders: OrderRepository,
    private readonly orderItems: OrderItemRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async handleCheckout(userId: string, dto: CheckoutDto) {
    const items = await this.checkout.loadCart(userId);
    const coupon = await this.checkout.resolveCoupon(dto.couponCode);
    const subtotal = this.checkout.subtotalCents(items);
    const totalCents = this.checkout.applyCoupon(subtotal, coupon);
    const stockIds: string[] = [];

    const order = await this.tx.execTx(
      async (tx: { [key: string]: unknown }) => {
        for (const item of items) {
          const lockArgs = {
            tx,
            where: { productId: item.productId },
            select: getStockLockSelect(),
            lock: { mode: 'update' as const },
            setCache: false as const,
          };
          const stock = await this.stocks.getFirst(lockArgs);
          if (!stock) {
            throw new CustomError({
              statusCode: 409,
              message: `Stock missing for product ${item.productId}`,
              code: EErrorCode.INSUFFICIENT_STOCK,
            });
          }
          if (stock.qty < item.qty) {
            throw new CustomError({
              statusCode: 409,
              message: `Insufficient stock for ${item.product.sku}`,
              code: EErrorCode.INSUFFICIENT_STOCK,
            });
          }
          stockIds.push(stock.id);
          await this.stocks.updateById({
            tx,
            id: stock.id,
            data: { qty: { decrement: item.qty } },
            invalidate: 'none',
          });
        }

        const created = await this.orders.create({
          tx,
          data: {
            userId,
            couponId: coupon?.id,
            status: 'PENDING',
            totalCents,
          },
          select: { id: true },
          invalidate: 'none',
        });

        await this.orderItems.createMany({
          tx,
          data: items.map((item) => ({
            orderId: created.id,
            productId: item.productId,
            qty: item.qty,
            priceCents: item.product.priceCents,
          })),
        });

        await this.cartItems.deleteMany({
          tx,
          where: { userId },
          invalidate: 'none',
        });

        await this.auditLogs.create({
          tx,
          data: {
            actorId: userId,
            action: 'CHECKOUT',
            entity: 'Order',
            entityId: created.id,
            payload: { totalCents, itemCount: items.length },
          },
        });

        return this.orders.getThrowById({
          tx,
          id: created.id,
          select: getOrderSelect(),
          setCache: false,
        });
      },
      async () => {
        await this.orders.invalidateCache({});
        await this.cartItems.invalidateCache({});
        await Promise.all(
          stockIds.map((id) => this.stocks.invalidateCache({ id })),
        );
      },
    );

    return order;
  }
}
