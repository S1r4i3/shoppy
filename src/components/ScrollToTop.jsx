import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Braces matter: newer Chrome returns a Promise from scrollTo, and an effect
    // must return nothing (or a cleanup function), otherwise React crashes.
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
