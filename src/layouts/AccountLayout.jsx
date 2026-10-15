import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingShapes from '../components/layout/FloatingShapes.jsx';
import AccountSidebar from '../components/layout/AccountSidebar.jsx';
import LogoutModal from '../components/layout/LogoutModal.jsx';
import MainHeader from '../components/layout/MainHeader.jsx';
import AppMenuDrawer from '../components/layout/AppMenuDrawer.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FALLBACK_MEMBER } from '../services/accountService.js';
import '../styles/account.css';

// Shell for logged-in account pages (Dashboard, Edit Profile, Gallery, ...):
// header with back arrow, page title block, account sidebar, content column, mobile bottom nav.
//
// pageClass      : extra class for page-specific scoped CSS (e.g. "page-close-account")
// subtitle       : small line under the brand in the header
// title/description : the page heading block (title may contain JSX such as the gradient word)
// sidebarActive  : key of the highlighted sidebar item
// sidebarVariant : 'full' | 'compact' | 'compact-legacy' (see AccountSidebar)
// pills          : optional custom pill row for phones
// navActive/navLastItem/badges : bottom nav highlight and unread counts
// overlays       : modals etc. rendered outside <main> (so `space-y-*` of the content does not move them)
export default function AccountLayout({
  pageClass = '',
  subtitle,
  title,
  description,
  sidebarActive,
  sidebarVariant,
  pills,
  navActive = 'me',
  navLastItem,
  badges,
  contentClassName = 'flex-1 space-y-6 animate-slide-up',
  overlays,
  children,
}) {
  const { member: authMember, signOut } = useAuth();
  const member = authMember || FALLBACK_MEMBER;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const askLogout = () => setLogoutOpen(true);
  function confirmLogout() {
    setLogoutOpen(false);
    signOut();
    navigate('/login');
  }

  return (
    <div className={`account-page${pageClass ? ` ${pageClass}` : ''} bg-gradient-to-br from-brand-soft via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 min-h-screen pb-safe-nav md:pb-10`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <FloatingShapes />
      <MainHeader member={member} active={navActive} variant="me" onLogout={askLogout} onOpenMenu={() => setMenuOpen(true)} />

      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold mb-2">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AccountSidebar active={sidebarActive} variant={sidebarVariant} pills={pills} />
          <div className={contentClassName}>{children}</div>
        </div>
      </main>

      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} member={member} onLogout={askLogout} />
      <LogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />

      <MobileBottomNav active={navActive} badges={badges} lastItem={navLastItem} />
      {overlays}
    </div>
  );
}
