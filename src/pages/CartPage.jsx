import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';
import OrderSummary from '../components/OrderSummary';
import Button from '../components/Button';
import { EmptyState, ErrorState, Loader } from '../components/StateViews';
import { TrashIcon } from '../components/Icons';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

export default function CartPage() {
  const { lines, totals, loading, error, hasUnavailable, updateQuantity, removeItem, maxPerItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  if (loading) return (<><AppHeader title="My Cart" /><Loader label="Loading your cart…" /></>);
  if (error) return (<><AppHeader title="My Cart" /><ErrorState message={error} /></>);
  if (lines.length === 0) {
    return (
      <>
        <AppHeader title="My Cart" />
        <EmptyState icon="🛒" title="Your cart is empty" message="Looks like you haven't added anything yet." actionLabel="Start shopping" actionTo="/products" />
      </>
    );
  }

  const changeQty = (productId, q) => {
    const res = updateQuantity(productId, q);
    if (!res.ok) toast.error(res.message);
  };
  const remove = (line) => {
    removeItem(line.productId);
    toast.info(`${line.product.name} removed from cart.`);
  };

  return (
    <>
      <AppHeader title="My Cart" />
      <ul className="cart-list">
        {lines.map((line) => {
          const { product, quantity } = line;
          const out = product.stock === 0;
          const over = !out && quantity > product.stock;
          return (
            <li key={product.id} className={`card cart-item ${out ? 'is-out' : ''}`}>
              <Link to={`/products/${product.id}`}><ProductImage src={product.image} productId={product.id} className="cart-item__img" /></Link>
              <div className="cart-item__body">
                <Link to={`/products/${product.id}`} className="cart-item__name">{product.name}</Link>
                <span className="price">{formatPrice(product.price)}</span>
                {out && <span className="field__error">Out of stock — remove to continue</span>}
                {over && <span className="field__error">Only {product.stock} available — reduce quantity</span>}
                <div className="cart-item__actions">
                  <QuantityStepper value={quantity} max={Math.min(Math.max(product.stock, quantity), maxPerItem)} onChange={(q) => changeQty(product.id, q)} disabled={out} />
                  <button className="icon-btn icon-btn--danger" onClick={() => remove(line)} aria-label={`Remove ${product.name}`}><TrashIcon /></button>
                </div>
              </div>
              <strong className="cart-item__line">{formatPrice(product.price * quantity)}</strong>
            </li>
          );
        })}
      </ul>
      <OrderSummary totals={totals} />
      <div className="sticky-cta">
        {hasUnavailable && <p className="notice notice--warn">Some items are unavailable. Update your cart to proceed.</p>}
        <Button block size="lg" disabled={hasUnavailable} onClick={() => navigate('/checkout')}>
          Proceed to Checkout · {formatPrice(totals.total)}
        </Button>
      </div>
    </>
  );
}
