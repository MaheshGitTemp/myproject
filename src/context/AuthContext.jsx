import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Mock session. Stored in localStorage ("remember me") or sessionStorage.
// When the real API exists, keep this interface (user, signIn, signOut) and swap the storage for tokens.
const KEY = 'ts_session';

function readSession() {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const signIn = useCallback((nextUser, remember = false) => {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
      (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(nextUser));
    } catch {
      /* storage blocked: session lasts until reload */
    }
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
