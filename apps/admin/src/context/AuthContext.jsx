import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../api.js';

// Real cookie-session auth. Reuses the member backend:
//   GET  /auth/me      -> { user }         (401 when anonymous)
//   POST /auth/login   -> { ok, user }     body { identifier, password }
//   POST /auth/logout  -> { ok }
// Only users with user.isAdmin are allowed into the admin panel.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiGet('/auth/me');
      setUser(data?.user ?? null);
      return data?.user ?? null;
    } catch {
      // 401 (api.js may redirect) or network error: treat as logged out.
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await refreshMe();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refreshMe]);

  const signOut = useCallback(async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      /* ignore: clear local state regardless */
    }
    setUser(null);
  }, []);

  const signIn = useCallback(
    async ({ identifier, password }) => {
      await apiPost('/auth/login', { identifier, password });
      // Re-fetch the canonical user (ensures isAdmin reflects the server).
      const me = await refreshMe();
      if (!me) {
        throw new Error('Login succeeded but the session could not be loaded.');
      }
      if (!me.isAdmin) {
        // A valid member who is not an admin must not stay signed in here.
        await signOut();
        throw new Error('This account does not have admin access.');
      }
      return me;
    },
    [refreshMe, signOut],
  );

  const value = useMemo(
    () => ({
      user,
      isAdmin: !!user?.isAdmin,
      loading,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
