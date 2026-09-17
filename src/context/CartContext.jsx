import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';
import { getLiveProduct } from '../services/productService';
import { computeTotals } from '../utils/cartTotals';

const CartContext = createContext(null);
const MAX_PER_ITEM = 10;

const initialState = { items: [], loading: false, loaded: false, error: null };

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { items: action.items, loading: false, loaded: true, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'ADD': {
      const existing = state.items.find((i) => i.productId === action.productId);
      const items = existing
        ? state.items.map((i) => (i.productId === action.productId ? { ...i, quantity: action.quantity } : i))
        : [...state.items, { productId: action.productId, quantity: action.quantity }];
      return { ...state, items };
    }
    case 'SET_QTY':
      return {
        ...state,
        items: state.items.map((i) => (i.productId === action.productId ? { ...i, quantity: action.quantity } : i)),
      };
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { token, isAuthenticated, handleAuthError } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const skipSave = useRef(true);

  // Load the authenticated user's cart; reset on sign-out.
  useEffect(() => {
    if (!isAuthenticated) {
      skipSave.current = true;
      dispatch({ type: 'RESET' });
      return;
    }
    dispatch({ type: 'LOAD_START' });
    cartService
      .get(token)
      .then((items) => {
        skipSave.current = true;
        dispatch({ type: 'LOAD_SUCCESS', items });
      })
      .catch((err) => {
        if (!handleAuthError(err)) dispatch({ type: 'LOAD_ERROR', error: err.message });
      });
  }, [isAuthenticated, token, handleAuthError]);

  // Persist cart changes to the backend.
  useEffect(() => {
    if (!state.loaded || !isAuthenticated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    cartService.save(token, state.items).catch(handleAuthError);
  }, [state.items, state.loaded, isAuthenticated, token, handleAuthError]);

  // Resolve cart items against live product data (price / stock may change).
  const lines = useMemo(
    () =>
      state.items
        .map((i) => ({ ...i, product: getLiveProduct(i.productId) }))
        .filter((l) => l.product),
    [state.items],
  );
  const totals = useMemo(() => computeTotals(lines.filter((l) => l.product.stock > 0)), [lines]);
  const hasUnavailable = lines.some((l) => l.product.stock === 0 || l.quantity > l.product.stock);

  /** Returns { ok, message } so the UI can give feedback. */
  const addItem = useCallback(
    (productId, qty = 1) => {
      const product = getLiveProduct(productId);
      if (!product) return { ok: false, message: 'Product not found.' };
      if (product.stock === 0) return { ok: false, message: `${product.name} is out of stock.` };
      const current = state.items.find((i) => i.productId === productId)?.quantity ?? 0;
      const limit = Math.min(product.stock, MAX_PER_ITEM);
      if (current >= limit) return { ok: false, message: `You already have the maximum available quantity (${limit}).` };
      const quantity = Math.min(current + qty, limit);
      dispatch({ type: 'ADD', productId, quantity });
      return {
        ok: true,
        message: quantity < current + qty ? `Only ${limit} can be added. Cart updated.` : `${product.name} added to cart.`,
      };
    },
    [state.items],
  );

  const updateQuantity = useCallback((productId, quantity) => {
    const product = getLiveProduct(productId);
    if (!product) return { ok: false, message: 'Product not found.' };
    const limit = Math.min(product.stock, MAX_PER_ITEM);
    if (quantity < 1) return { ok: false, message: 'Quantity must be at least 1.' };
    if (quantity > limit) return { ok: false, message: `Only ${limit} available for this item.` };
    dispatch({ type: 'SET_QTY', productId, quantity });
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      lines,
      totals,
      hasUnavailable,
      maxPerItem: MAX_PER_ITEM,
      addItem,
      updateQuantity,
      removeItem: (productId) => dispatch({ type: 'REMOVE', productId }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      getQuantity: (productId) => state.items.find((i) => i.productId === productId)?.quantity ?? 0,
    }),
    [state, lines, totals, hasUnavailable, addItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
