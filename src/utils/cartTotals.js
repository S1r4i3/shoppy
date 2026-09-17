import { config } from '../services/config';

/** Pure function: compute order totals from cart lines [{ product, quantity }]. */
export function computeTotals(lines) {
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryFee;
  const tax = Math.round(subtotal * config.taxRate);
  return { itemCount, subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax };
}
