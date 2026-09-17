import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './StateViews';

/** Only authenticated users may access child routes. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <Loader label="Checking your session…" />;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Sign-in / register pages redirect away when already signed in. */
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <Loader label="Checking your session…" />;
  if (status === 'authenticated') return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  return <Outlet />;
}
