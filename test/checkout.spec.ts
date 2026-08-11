import { CustomError } from 'src/common/exceptions/custom-error';
import { EErrorCode } from 'src/common/enums/error.enum';
import { CheckoutHelper } from 'src/modules/order/helpers/checkout.helper';
import { OrderService } from 'src/modules/order/services/order.service';

describe('Checkout execTx', () => {
  const cartItem = {
    userId: 'u1',
    productId: 'p1',
    qty: 2,
    product: { id: 'p1', name: 'Keyboard', sku: 'KB-01', priceCents: 1000 },
  };

  function buildService(overrides?: {
    stockQty?: number;
    cartItems?: typeof cartItem[];
  }) {
    const stock = {
      id: 's1',
      productId: 'p1',
      qty: overrides?.stockQty ?? 10,
    };
    const createdOrder = {
      id: 'o1',
      userId: 'u1',
      status: 'PENDING',
      totalCents: 2000,
      createdAt: new Date(),
      items: [],
    };

    const cartItems = {
      getMany: jest.fn().mockResolvedValue(overrides?.cartItems ?? [cartItem]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      invalidateCache: jest.fn().mockResolvedValue(undefined),
    };
    const coupons = {
      getFirst: jest.fn().mockResolvedValue(null),
    };
    const stocks = {
      getFirst: jest.fn().mockResolvedValue(stock),
      updateById: jest.fn().mockResolvedValue({ ...stock, qty: stock.qty - 2 }),
      invalidateCache: jest.fn().mockResolvedValue(undefined),
    };
    const orders = {
      create: jest.fn().mockResolvedValue({ id: 'o1' }),
      getThrowById: jest.fn().mockResolvedValue(createdOrder),
      invalidateCache: jest.fn().mockResolvedValue(undefined),
    };
    const orderItems = {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    const auditLogs = {
      create: jest.fn().mockResolvedValue({ id: 'a1' }),
    };
    const tx = {
      execTx: jest.fn(async (fn: (client: object) => unknown, after?: () => Promise<void>) => {
        const result = await fn({});
        await after?.();
        return result;
      }),
    };

    const checkout = new CheckoutHelper(cartItems as never, coupons as never);
    const service = new OrderService(
      tx as never,
      checkout,
      cartItems as never,
      stocks as never,
      orders as never,
      orderItems as never,
      auditLogs as never,
    );

    return { service, tx, stocks, orders, orderItems, cartItems, auditLogs };
  }

  it('locks stock, creates order lines, decrements, then invalidates after commit', async () => {
    const ctx = buildService();
    const result = await ctx.service.handleCheckout('u1', {});

    expect(result.id).toBe('o1');
    expect(ctx.tx.execTx).toHaveBeenCalledTimes(1);
    expect(ctx.stocks.getFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        lock: { mode: 'update' },
        setCache: false,
      }),
    );
    expect(ctx.stocks.updateById).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 's1',
        data: { qty: { decrement: 2 } },
        invalidate: 'none',
      }),
    );
    expect(ctx.orderItems.createMany).toHaveBeenCalled();
    expect(ctx.cartItems.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ invalidate: 'none' }),
    );
    expect(ctx.auditLogs.create).toHaveBeenCalled();
    expect(ctx.orders.invalidateCache).toHaveBeenCalled();
    expect(ctx.stocks.invalidateCache).toHaveBeenCalledWith({ id: 's1' });
  });

  it('throws INSUFFICIENT_STOCK when lock shows not enough qty', async () => {
    const ctx = buildService({ stockQty: 1 });
    await expect(ctx.service.handleCheckout('u1', {})).rejects.toMatchObject({
      code: EErrorCode.INSUFFICIENT_STOCK,
    });
    expect(ctx.orders.create).not.toHaveBeenCalled();
  });

  it('rejects an empty cart before opening a transaction', async () => {
    const ctx = buildService({ cartItems: [] });
    await expect(ctx.service.handleCheckout('u1', {})).rejects.toBeInstanceOf(
      CustomError,
    );
    expect(ctx.tx.execTx).not.toHaveBeenCalled();
  });
});
