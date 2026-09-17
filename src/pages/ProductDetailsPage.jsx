import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Button from '../components/Button';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';
import RatingStars from '../components/RatingStars';
import StockBadge from '../components/StockBadge';
import { ErrorState, Loader } from '../components/StateViews';
import { getCategory } from '../data/categories';
import { productService } from '../services/productService';
import { useAsync } from '../hooks/useAsync';
import { useAddToCart } from '../hooks/useAddToCart';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data: product, loading, error, retry } = useAsync(() => productService.getById(id), [id]);
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const { getQuantity, maxPerItem } = useCart();

  if (loading) return (<><AppHeader title="Product" back /><Loader label="Loading product…" /></>);
  if (error) return (<><AppHeader title="Product" back /><ErrorState message={error.message} onRetry={error.status === 404 ? undefined : retry} /><p className="center"><Link to="/products">Browse products</Link></p></>);

  const inCart = getQuantity(product.id);
  const maxAddable = Math.max(0, Math.min(product.stock, maxPerItem) - inCart);
  const out = product.stock === 0;
  const category = getCategory(product.category);

  return (
    <>
      <AppHeader title={category?.name} back />
      <article className="details">
        <ProductImage className="details__img" src={product.image} productId={product.id} alt={product.name} />
        <div className="details__body">
          <Link to={`/products?category=${product.category}`} className="details__category">{category?.name}</Link>
          <h2 className="details__name">{product.name}</h2>
          <div className="details__row">
            <strong className="price price--lg">{formatPrice(product.price)}</strong>
            <RatingStars rating={product.rating} />
          </div>
          <StockBadge stock={product.stock} />
          <h3 className="details__subhead">Description</h3>
          <p className="details__desc">{product.description}</p>

          {out ? (
            <p className="notice notice--warn">This product is currently unavailable. Please check back later.</p>
          ) : (
            <>
              {inCart > 0 && <p className="notice notice--info">You have {inCart} in your cart.</p>}
              {maxAddable > 0 ? (
                <div className="details__actions">
                  <QuantityStepper value={Math.min(qty, maxAddable)} max={maxAddable} onChange={setQty} />
                  <Button block onClick={() => addToCart(product.id, Math.min(qty, maxAddable)) && setQty(1)}>
                    Add to Cart · {formatPrice(product.price * Math.min(qty, maxAddable))}
                  </Button>
                </div>
              ) : (
                <p className="notice notice--warn">You've added the maximum available quantity. <Link to="/cart">Go to cart</Link></p>
              )}
            </>
          )}
        </div>
      </article>
    </>
  );
}
