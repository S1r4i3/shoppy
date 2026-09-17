import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import ProductGrid from '../components/ProductGrid';
import ProductImage from '../components/ProductImage';
import { ErrorState, ProductGridSkeleton } from '../components/StateViews';
import { SearchIcon } from '../components/Icons';
import { CATEGORIES } from '../data/categories';
import { productService } from '../services/productService';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const { data, loading, error, retry } = useAsync(() => productService.list({ availability: 'in' }));

  const topRated = data ? [...data].sort((a, b) => b.rating - a.rating).slice(0, 4) : [];
  const budget = data ? data.filter((p) => p.price <= 800).sort((a, b) => a.price - b.price) : [];

  const submit = (e) => {
    e.preventDefault();
    navigate(term.trim() ? `/products?search=${encodeURIComponent(term.trim())}` : '/products');
  };

  return (
    <>
      <AppHeader />

      <section className="splash" aria-label="Welcome">
        <img src="/hero.jpg" alt="Shopping trolley in a department store aisle" className="splash__img" />
        <div className="splash__text">
          <h2>Shopping And Department Store.</h2>
          <p>Kitchen essentials, dining, décor and home basics — picked with care and delivered to your door.</p>
          <Link to="/products" className="pill-btn pill-btn--primary">Start shopping</Link>
        </div>
      </section>

      <div className="home-top">
        <p className="home-greet">
          {greeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}
          <span>What does your home need today?</span>
        </p>
        <form className="search-bar" onSubmit={submit} role="search">
          <SearchIcon />
          <input type="search" placeholder="Search for pans, lamps, plates…" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Search products" />
        </form>
      </div>

      <ul className="perks" aria-label="Why shop with us">
        <li><strong>Free delivery</strong><span>on ₹999+</span></li>
        <li><strong>Pay later</strong><span>cash or UPI</span></li>
        <li><strong>Safe sign-in</strong><span>protected</span></li>
      </ul>

      <section className="section">
        <div className="section__head">
          <h2>Shop by category</h2>
          <Link to="/categories">See all</Link>
        </div>
        <div className="cat-scroll">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/products?category=${c.id}`} className="cat-pill">
              <span className="cat-pill__img" style={{ '--cat': c.color }}>
                <img src={c.image} alt="" loading="lazy" />
              </span>
              <span className="cat-pill__name">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {budget.length > 0 && (
        <section className="section section--tight">
          <div className="section__head">
            <h2>Under ₹800</h2>
            <Link to="/products?maxPrice=800&sort=price-asc">View all</Link>
          </div>
          <div className="mini-scroll">
            {budget.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="mini-card">
                <ProductImage src={p.image} productId={p.id} alt={p.name} className="mini-card__img" />
                <span className="mini-card__name">{p.name}</span>
                <strong>{formatPrice(p.price)}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__head">
          <h2>Customer favourites</h2>
          <Link to="/products?sort=rating">View all</Link>
        </div>
        {loading && <ProductGridSkeleton count={4} />}
        {error && <ErrorState message={error.message} onRetry={retry} />}
        {data && <ProductGrid products={topRated} />}
      </section>
    </>
  );
}
