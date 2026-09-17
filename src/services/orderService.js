import { transaction, query } from './mockDb';
import { simulate } from './apiClient';
import { requireUser } from './authService';
import { getLiveProduct } from './productService';
import { ApiError, ERR } from './errors';
import { randomHex } from './crypto';
import { computeTotals } from '../utils/cartTotals';
import { validateDelivery, validateQuantity, hasErrors } from '../utils/validators';

export const orderService = {
  /**
   * Places an order. Prices and stock are re-validated on the "server" so the
   * client cannot tamper with totals.
   */
  place: (token, { items, delivery }) =>
    simulate(async () => {
      const { user } = await requireUser(token);
      if (!items?.length) throw new ApiError('Your cart is empty.', ERR.VALIDATION);
      const errors = validateDelivery(delivery);
      if (hasErrors(errors)) throw Object.assign(new ApiError('Please fix the delivery details.', ERR.VALIDATION), { fields: errors });

      const lines = items.map(({ productId, quantity }) => {
        const product = getLiveProduct(productId);
        if (!product) throw new ApiError('A product in your cart is no longer available.', ERR.NOT_FOUND);
        const qErr = validateQuantity(quantity, product.stock);
        if (product.stock === 0) throw new ApiError(`"${product.name}" is out of stock. Please remove it from your cart.`, ERR.OUT_OF_STOCK);
        if (qErr) throw new ApiError(`${product.name}: ${qErr}`, ERR.OUT_OF_STOCK);
        return { product, quantity };
      });

      const totals = computeTotals(lines);
      const order = {
        id: `MS${Date.now().toString().slice(-6)}${randomHex(2).toUpperCase()}`,
        userId: user.id,
        items: lines.map(({ product, quantity }) => ({
          productId: product.id, name: product.name, price: product.price, image: product.image, quantity,
        })),
        delivery: { ...delivery },
        totals,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 4 * 86400000).toISOString(),
      };

      transaction((db) => {
        lines.forEach(({ product, quantity }) => {
          db.inventory[product.id] = Math.max(0, (db.inventory[product.id] ?? product.stock) - quantity);
        });
        db.orders.push(order);
        db.carts[user.id] = [];
      });
      return order;
    }),

  getById: (token, orderId) =>
    simulate(async () => {
      const { user } = await requireUser(token);
      const order = query((db) => db.orders.find((o) => o.id === orderId && o.userId === user.id));
      if (!order) throw new ApiError('Order not found.', ERR.NOT_FOUND, 404);
      return order;
    }),
};
