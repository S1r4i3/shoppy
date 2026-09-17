import { Link, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ProductImage from '../components/ProductImage';
import OrderSummary from '../components/OrderSummary';
import { ErrorState, Loader } from '../components/StateViews';
import { CheckIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { useAsync } from '../hooks/useAsync';
import { formatDate, formatPrice } from '../utils/format';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const { data: order, loading, error } = useAsync(() => orderService.getById(token, orderId), [orderId, token]);

  if (loading) return (<><AppHeader title="Order" /><Loader label="Fetching your order…" /></>);
  if (error) return (<><AppHeader title="Order" /><ErrorState message={error.message} /><p className="center"><Link to="/">Back to home</Link></p></>);

  const d = order.delivery;
  return (
    <>
      <AppHeader title="Order Confirmed" />
      <section className="confirm">
        <div className="success-mark"><CheckIcon width={40} height={40} /></div>
        <h2>Thank you for your order!</h2>
        <p>Order ID <strong>#{order.id}</strong></p>
        <p className="muted">Placed on {formatDate(order.createdAt)}</p>
        <p className="notice notice--info">Estimated delivery by <strong>{new Date(order.estimatedDelivery).toDateString()}</strong></p>
      </section>

      <section className="card">
        <h2 className="summary__title">Items</h2>
        <ul className="review-list">
          {order.items.map((i) => (
            <li key={i.productId}>
              <ProductImage src={i.image} productId={i.productId} />
              <span className="review-list__name">{i.name}<small>Qty {i.quantity} × {formatPrice(i.price)}</small></span>
              <strong>{formatPrice(i.price * i.quantity)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="summary__title">Delivering to</h2>
        <p className="address">
          <strong>{d.fullName}</strong> · {d.phone}<br />
          {d.addressLine}<br />
          {d.city}, {d.state} – {d.pincode}
        </p>
        <p className="muted">Payment: {d.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI on Delivery'}</p>
      </section>

      <OrderSummary totals={order.totals} title="Amount Payable" />
      <div className="section"><Link to="/products" className="btn btn--primary btn--lg btn--block">Continue Shopping</Link></div>
    </>
  );
}
