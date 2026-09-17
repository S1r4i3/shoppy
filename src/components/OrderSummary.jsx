import { formatPrice } from '../utils/format';
import { config } from '../services/config';

export default function OrderSummary({ totals, title = 'Order Summary' }) {
  return (
    <section className="card summary" aria-label={title}>
      <h2 className="summary__title">{title}</h2>
      <dl>
        <div><dt>Items ({totals.itemCount})</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
        <div><dt>Delivery</dt><dd>{totals.deliveryFee === 0 ? <span className="text-success">FREE</span> : formatPrice(totals.deliveryFee)}</dd></div>
        <div><dt>GST ({Math.round(config.taxRate * 100)}%)</dt><dd>{formatPrice(totals.tax)}</dd></div>
        <div className="summary__total"><dt>Total payable</dt><dd>{formatPrice(totals.total)}</dd></div>
      </dl>
      {totals.deliveryFee > 0 && (
        <p className="summary__hint">Add {formatPrice(config.freeDeliveryThreshold - totals.subtotal)} more for free delivery.</p>
      )}
    </section>
  );
}
