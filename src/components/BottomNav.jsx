import { NavLink } from 'react-router-dom';
import { CartIcon, GridIcon, HomeIcon } from './Icons';
import { useCart } from '../context/CartContext';

// Three tabs, as in the wireframe: Home · Categories · Cart
const tabs = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/categories', label: 'Categories', Icon: GridIcon },
  { to: '/cart', label: 'Cart', Icon: CartIcon },
];

export default function BottomNav() {
  const { totals } = useCart();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon">
            <Icon width={24} height={24} />
            {label === 'Cart' && totals.itemCount > 0 && <span className="count-badge">{totals.itemCount}</span>}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
