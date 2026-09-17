import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

/** Adds to cart for signed-in users; otherwise sends the user to sign in. */
export function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (productId, qty = 1) => {
      if (!isAuthenticated) {
        toast.info('Please sign in to add items to your cart.');
        navigate('/login', { state: { from: location } });
        return false;
      }
      const res = addItem(productId, qty);
      (res.ok ? toast.success : toast.error)(res.message);
      return res.ok;
    },
    [isAuthenticated, addItem, toast, navigate, location],
  );
}
