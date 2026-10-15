import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { config } from '../config/index.js';
import { buildMember, getMe, getMyProfile, getStats } from '../services/accountService.js';
import { CURRENT_MEMBER } from '../services/profileService.js';

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
  // The REAL logged-in member (merged identity + profile). null when logged out
  // or before the first hydrate completes; consumers pair it with FALLBACK_MEMBER.
  const [member, setMember] = useState(null);

  // Hydrate `member` from the backend: GET /auth/me for identity, then
  // GET /profiles/me for photo/age/city/membership. A 401 (getMe -> null)
  // yields member=null with no crash. A NETWORK error (getMe throws) falls back
  // to CURRENT_MEMBER only when USE_MOCK_FALLBACK is on, so the app still runs
  // while the backend is down.
  const refreshMember = useCallback(async () => {
    try {
      const me = await getMe();
      if (!me) {
        setMember(null);
        return;
      }
      let profile = null;
      try {
        const res = await getMyProfile();
        profile = res ? res.profile : null;
      } catch {
        profile = null; // identity is enough to build a member
      }
      const base = buildMember(me, profile);
      // Hydrate the real stats + unread counts on top of buildMember's safe
      // zeros. getStats() never throws (it falls back to zeros), so a failure
      // here just leaves the defensive defaults in place.
      try {
        const { stats, unread } = await getStats();
        const s = stats || {};
        const u = unread || {};
        base.stats = {
          views: Number(s.profileViews) || 0,
          shortlisted: Number(s.shortlistedCount) || 0,
          mutual: Number(s.mutual) || 0,
        };
        base.unread = {
          notifications: Number(u.notifications) || 0,
          chat: Number(u.chat) || 0,
          dashboard: 0,
        };
      } catch {
        // keep buildMember's defensive zeros
      }
      setMember(base);
    } catch {
      // network error reaching the API
      if (config.USE_MOCK_FALLBACK) setMember(CURRENT_MEMBER);
      else setMember(null);
    }
  }, []);

  useEffect(() => {
    refreshMember();
  }, [refreshMember]);

  const signIn = useCallback(
    (nextUser, remember = false) => {
      try {
        localStorage.removeItem(KEY);
        sessionStorage.removeItem(KEY);
        (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(nextUser));
      } catch {
        /* storage blocked: session lasts until reload */
      }
      setUser(nextUser);
      refreshMember();
    },
    [refreshMember],
  );

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
    setMember(null);
  }, []);

  const value = useMemo(
    () => ({ user, member, signIn, signOut, refreshMember }),
    [user, member, signIn, signOut, refreshMember],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
