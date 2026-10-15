import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FloatingShapes from '../../../components/layout/FloatingShapes.jsx';
import LogoutModal from '../../../components/layout/LogoutModal.jsx';
import MainHeader from '../../../components/layout/MainHeader.jsx';
import MobileBottomNav from '../../../components/layout/MobileBottomNav.jsx';
import AppMenuDrawer from '../../../components/layout/AppMenuDrawer.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import { getProfileById, normalizeId } from '../../../services/profileLookupService.js';
import { FALLBACK_MEMBER } from '../../../services/accountService.js';
import '../../../styles/account.css';
import '../../../styles/pages/profile-details.css';
import { ActionRow, ProfileHeaderCard } from './components/ProfileHeaderCard.jsx';
import ProfileTabs from './components/ProfileTabs.jsx';
import { Loading, LoadError, NotFound } from './components/StateCards.jsx';

// URL: /profile-details?id=MAT2087
export default function ProfileDetails() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { member: authMember, signOut } = useAuth();
  const member = authMember || FALLBACK_MEMBER;
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const askLogout = () => setLogoutOpen(true);
  function confirmLogout() {
    setLogoutOpen(false);
    signOut();
    navigate('/login');
  }
  const raw = params.get('id');
  const requestedId = raw ? (normalizeId(raw) || String(raw).slice(0, 20)) : '';
  // state: loading | ready | notfound | noid | error
  const [state, setState] = useState(raw ? 'loading' : 'noid');
  const [profile, setProfile] = useState(null);

  const [attempt, setAttempt] = useState(0); // bumped by "Try again"

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!requestedId) { setState('noid'); return; }
      setState('loading');
      const result = await getProfileById(requestedId);
      if (!alive) return; // a newer id was requested meanwhile
      if (result.status === 'found') { setProfile(result.profile); setState('ready'); } else setState(result.status === 'not_found' ? 'notfound' : 'error');
    })();
    return () => { alive = false; };
  }, [requestedId, attempt]);

  usePageMeta({
    title: state === 'ready' ? `${profile.fullName || profile.name} (${profile.id}) | Telugu Sambandham` : 'Profile Details | Telugu Sambandham',
    description: 'View profile details, family background and horoscope on Telugu Sambandham.',
    robots: 'noindex, nofollow',
  });

  return (
    <div className="account-page page-profile-details bg-gradient-to-br from-brand-soft via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 min-h-screen pb-24 md:pb-10">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <FloatingShapes />
      <MainHeader member={member} active="search" variant="me" onLogout={askLogout} onOpenMenu={() => setMenuOpen(true)} />

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        {state === 'loading' && <Loading />}
        {(state === 'notfound' || state === 'noid') && <NotFound noId={state === 'noid'} requestedId={requestedId} />}
        {state === 'error' && <LoadError onRetry={() => setAttempt((n) => n + 1)} />}
        {state === 'ready' && (
          <div>
            <ProfileHeaderCard profile={profile} />
            <ActionRow profile={profile} />
            <ProfileTabs key={profile.id} profile={profile} />
          </div>
        )}
      </main>

      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} member={member} onLogout={askLogout} />
      <LogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />

      <MobileBottomNav active="search" badges={{ chat: 5 }} />
    </div>
  );
}
