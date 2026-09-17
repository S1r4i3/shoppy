import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '../services/authService';
import { tokenStore } from '../services/sessionStorage';
import { ERR } from '../services/errors';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => tokenStore.get());
  const [expiresAt, setExpiresAt] = useState(null);
  const [status, setStatus] = useState(token ? 'checking' : 'guest'); // checking | authenticated | guest
  const [authNotice, setAuthNotice] = useState(null); // message shown on login screen
  const timerRef = useRef(null);
  const toast = useToast();

  const clearSession = useCallback((notice = null) => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    setStatus('guest');
    setAuthNotice(notice);
  }, []);

  const startSession = useCallback(({ user: u, token: t, expiresAt: exp }) => {
    tokenStore.set(t);
    setToken(t);
    setUser(u);
    setExpiresAt(exp);
    setStatus('authenticated');
    setAuthNotice(null);
  }, []);

  // Restore session on app load.
  useEffect(() => {
    if (!token || status !== 'checking') return;
    authService
      .me(token)
      .then(({ user: u, expiresAt: exp }) => {
        setUser(u);
        setExpiresAt(exp);
        setStatus('authenticated');
      })
      .catch((err) =>
        clearSession(err.code === ERR.SESSION_EXPIRED ? 'Your session has expired. Please sign in again.' : null),
      );
  }, [token, status, clearSession]);

  // Keep the session alive while the user is active (throttled to once a minute).
  useEffect(() => {
    if (status !== 'authenticated' || !token) return undefined;
    let last = 0;
    const onActivity = () => {
      if (document.visibilityState === 'hidden' || Date.now() - last < 60_000) return;
      last = Date.now();
      authService
        .touch(token)
        .then(({ expiresAt: exp }) => setExpiresAt(exp))
        .catch(() => {}); // the expiry timer below handles real expiry
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'visibilitychange'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, [status, token]);

  // When the expiry time is reached, re-check with the backend before signing out
  // (the session may have been extended by activity or another tab).
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!expiresAt || !token) return undefined;
    const ms = Math.max(1000, Math.min(expiresAt - Date.now() + 500, 2 ** 31 - 1));
    timerRef.current = setTimeout(() => {
      authService
        .check(token)
        .then(({ expiresAt: exp }) => setExpiresAt(exp))
        .catch((err) => clearSession(err.code === ERR.SESSION_EXPIRED ? 'Your session has expired. Please sign in again.' : null));
    }, ms);
    return () => clearTimeout(timerRef.current);
  }, [expiresAt, token, clearSession]);

  /** Call from any feature when an API returns an auth error. Returns true if handled. */
  const handleAuthError = useCallback(
    (err) => {
      if (err?.code === ERR.SESSION_EXPIRED || err?.code === ERR.UNAUTHORIZED) {
        clearSession(err.message);
        toast?.error(err.message);
        return true;
      }
      return false;
    },
    [clearSession, toast],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      expiresAt,
      isAuthenticated: status === 'authenticated',
      authNotice,
      clearAuthNotice: () => setAuthNotice(null),
      login: async (creds) => startSession(await authService.login(creds)),
      register: async (form) => startSession(await authService.register(form)),
      logout: async () => {
        try {
          await authService.logout(token);
        } finally {
          clearSession('You have been signed out.');
        }
      },
      updateProfile: async (data) => {
        const u = await authService.updateProfile(token, data);
        setUser(u);
        return u;
      },
      changePassword: (data) => authService.changePassword(token, data),
      handleAuthError,
    }),
    [user, token, status, expiresAt, authNotice, startSession, clearSession, handleAuthError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
