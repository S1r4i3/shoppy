/**
 * Client-side session token storage.
 * - Only an opaque, random session token is stored (never passwords).
 * - sessionStorage is used so the token is cleared when the browser tab closes
 *   and is not shared across tabs. The server side (mock DB) stores only a hash
 *   of the token and enforces expiry.
 * In production, prefer an HttpOnly + Secure + SameSite cookie set by the backend,
 * or platform secure storage (Keychain/Keystore) in a native app.
 */
const TOKEN_KEY = 'myshoppy_session';

export const tokenStore = {
  get() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};
