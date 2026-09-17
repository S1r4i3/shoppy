import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import RatingStars from './RatingStars';
import StockBadge from './StockBadge';
import { HeartIcon } from './Icons';
import { formatPrice } from '../utils/format';
import { useAddToCart } from '../hooks/useAddToCart';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const addToCart = useAddToCart();
  const { getQuantity } = useCart();
  const wishlist = useWishlist();
  const out = product.stock === 0;
  const inCart = getQuantity(product.id) > 0;
  const liked = wishlist.has(product.id);

  return (
    <article className={`product-card ${out ? 'is-out' : ''}`}>
      <div className="product-card__media">
        <Link to={`/products/${product.id}`} tabIndex={-1} aria-hidden="true">
          <ProductImage src={product.image} productId={product.id} alt="" className="product-card__img" />
        </Link>
        <button
          className={`heart-btn ${liked ? 'is-on' : ''}`}
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <HeartIcon filled={liked} width={16} height={16} />
        </button>
      </div>

      <div className="product-card__body">
        <div className="product-card__top">
          <Link to={`/products/${product.id}`} className="product-card__name">{product.name}</Link>
          <strong className="product-card__price">{formatPrice(product.price)}</strong>
        </div>
        <p className="product-card__desc">{product.description}</p>
        <RatingStars rating={product.rating} />
        {out || product.stock <= 5 ? <StockBadge stock={product.stock} /> : null}
        <button
          className={`pill-btn ${inCart ? 'pill-btn--dark' : ''}`}
          disabled={out}
          onClick={() => addToCart(product.id)}
        >
          {out ? 'Unavailable' : inCart ? 'Add more' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
