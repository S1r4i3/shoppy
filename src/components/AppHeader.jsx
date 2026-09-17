import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackIcon, UserIcon } from './Icons';

/**
 * Wireframe header: MyShoppy logo on the left, profile icon on the right.
 * An optional title renders as the light-blue page band below it
 * (e.g. "Categories/ Kitchen").
 */
export default function AppHeader({ title, back = false }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <header className="app-header">
        <Link to="/" className="logo" aria-label="myShoppy home">
          <img src="/logo.png" alt="MyShoppy" className="logo__img" />
        </Link>
        <Link
          to={isAuthenticated ? '/profile' : '/login'}
          className={`icon-btn ${isAuthenticated ? 'avatar' : ''}`}
          aria-label={isAuthenticated ? 'My account' : 'Sign in'}
        >
          {isAuthenticated ? user.name.charAt(0).toUpperCase() : <UserIcon width={24} height={24} />}
        </Link>
      </header>
      {title && (
        <div className="page-band">
          {back && (
            <button className="page-band__back" onClick={() => navigate(-1)} aria-label="Go back">
              <BackIcon width={20} height={20} />
            </button>
          )}
          <h1>{title}</h1>
        </div>
      )}
    </>
  );
}
