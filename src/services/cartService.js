import { transaction, query } from './mockDb';
import { delay, simulate } from './apiClient';
import { requireUser } from './authService';

/** Cart is stored server-side per authenticated user. */
export const cartService = {
  get: (token) =>
    simulate(async () => {
      const { user } = await requireUser(token);
      return query((db) => db.carts[user.id] || []);
    }),

  // The write is committed immediately (like a request already sent) so a quick
  // page refresh never loses the latest cart change; latency is simulated afterwards.
  save: async (token, items) => {
    const { user } = await requireUser(token);
    transaction((db) => {
      db.carts[user.id] = items.map(({ productId, quantity }) => ({ productId, quantity }));
    });
    await delay(150);
    return items;
  },
};
