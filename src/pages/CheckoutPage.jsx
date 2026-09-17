import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import FormField from '../components/FormField';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';
import Modal from '../components/Modal';
import { CheckIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { validateDelivery, hasErrors } from '../utils/validators';
import { formatPrice } from '../utils/format';

const STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];

export default function CheckoutPage() {
  const { user, token, handleAuthError } = useAuth();
  const { lines, totals, items, hasUnavailable, clearCart, updateQuantity, maxPerItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '', phone: user?.phone || '', addressLine: user?.address || '',
    city: '', state: '', pincode: '', paymentMethod: 'cod',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!placedOrder && (lines.length === 0 || hasUnavailable)) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => {
    const value = k === 'phone' || k === 'pincode' ? e.target.value.replace(/\D/g, '') : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors(({ [k]: _omit, ...rest }) => rest); // eslint-disable-line no-unused-vars
  };

  async function onSubmit(e) {
    e.preventDefault();
    const v = validateDelivery(form);
    setErrors(v);
    if (hasErrors(v)) {
      toast.error('Please fill all mandatory delivery details.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderService.place(token, { items, delivery: form });
      setPlacedOrder(order);
      clearCart();
    } catch (err) {
      if (handleAuthError(err)) return;
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const orderTotals = placedOrder?.totals || totals;

  return (
    <>
      <AppHeader title="Checkout" back />
      <form className="form checkout" onSubmit={onSubmit} noValidate>
        <section className="card">
          <h2 className="summary__title">Review Item And Shipping</h2>
          <ul className="review-list">
            {(placedOrder?.items || lines.map((l) => ({ ...l.product, productId: l.productId, quantity: l.quantity }))).map((i) => (
              <li key={i.productId}>
                <ProductImage src={i.image} productId={i.productId} />
                <span className="review-list__name">
                  {i.name}
                  <small>{formatPrice(i.price)} each</small>
                  {!placedOrder && (
                    <QuantityStepper
                      value={i.quantity}
                      max={Math.min(i.stock ?? i.quantity, maxPerItem)}
                      onChange={(q) => {
                        const res = updateQuantity(i.productId, q);
                        if (!res.ok) toast.error(res.message);
                      }}
                      label={`Quantity for ${i.name}`}
                    />
                  )}
                </span>
                <strong>{formatPrice(i.price * i.quantity)}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="summary__title">Delivery Details</h2>
          <FormField label="Full name *" value={form.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" />
          <FormField label="Mobile number *" value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="numeric" maxLength={10} autoComplete="tel" hint="10-digit mobile number" />
          <FormField as="textarea" label="Address (house no, street, area) *" value={form.addressLine} onChange={set('addressLine')} error={errors.addressLine} autoComplete="street-address" />
          <div className="form__row">
            <FormField label="City *" value={form.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" />
            <FormField label="PIN code *" value={form.pincode} onChange={set('pincode')} error={errors.pincode} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
          </div>
          <FormField as="select" label="State *" value={form.state} onChange={set('state')} error={errors.state}>
            <option value="">Select state</option>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </FormField>
        </section>

        <section className="card">
          <h2 className="summary__title">Payment Method</h2>
          <div className="radio-group" role="radiogroup">
            {[
              { id: 'cod', label: 'Cash on Delivery' },
              { id: 'upi', label: 'UPI on Delivery' },
            ].map((m) => (
              <label key={m.id} className={`radio ${form.paymentMethod === m.id ? 'is-active' : ''}`}>
                <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={set('paymentMethod')} />
                {m.label}
              </label>
            ))}
          </div>
          <p className="field__hint">Online payment gateway integration is planned for a future release.</p>
        </section>

        <section className="total-price" aria-label="Total price">
          <h2>Total Price</h2>
          <ul>
            {(placedOrder?.items || lines.map((l) => ({ name: l.product.name, price: l.product.price, productId: l.productId, quantity: l.quantity }))).map((i) => (
              <li key={i.productId}>
                <span>{i.name}</span>
                <span>{i.quantity}</span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Delivery</dt><dd>{orderTotals.deliveryFee === 0 ? 'FREE' : formatPrice(orderTotals.deliveryFee)}</dd></div>
            <div><dt>GST (5%)</dt><dd>{formatPrice(orderTotals.tax)}</dd></div>
          </dl>
          <p className="total-price__total">Total : {formatPrice(orderTotals.total)}</p>
        </section>
        <div className="place-order">
          <button type="submit" className="pill-btn pill-btn--primary pill-btn--lg" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </div>
      </form>

      <Modal open={!!placedOrder} title="Order placed" onClose={() => navigate(`/order/${placedOrder.id}`, { replace: true })}>
        <div className="modal__art"><div className="success-mark"><CheckIcon width={36} height={36} /></div></div>
        <h2>Your order has been accepted</h2>
        <p>Order #{placedOrder?.id} · {placedOrder && formatPrice(placedOrder.totals.total)}</p>
        <button className="pill-btn pill-btn--orange" onClick={() => navigate(`/order/${placedOrder.id}`, { replace: true })}>View Order</button>
      </Modal>
    </>
  );
}
