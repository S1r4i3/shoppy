import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { CATEGORIES } from '../data/categories';
import products from '../data/products.json';

export default function CategoriesPage() {
  const counts = products.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {});
  return (
    <>
      <AppHeader title="Categories" />
      <div className="category-grid">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`/products?category=${c.id}`} className="category-tile" style={{ '--cat': c.color }}>
            <span className="category-tile__name">{c.name}</span>
            <img className="category-tile__img" src={c.image} alt="" loading="lazy" />
            <span className="category-tile__count">{counts[c.id] || 0} items</span>
          </Link>
        ))}
      </div>
    </>
  );
}
