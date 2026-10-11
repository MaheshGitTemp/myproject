import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppMenuDrawer from '../components/layout/AppMenuDrawer.jsx';
import FloatingShapes from '../components/layout/FloatingShapes.jsx';
import LogoutModal from '../components/layout/LogoutModal.jsx';
import MainHeader from '../components/layout/MainHeader.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';
import MobileMenuDrawer from '../components/layout/MobileMenuDrawer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useBodyClass from '../hooks/useBodyClass.js';
import { CURRENT_MEMBER } from '../services/profileService.js';

const BODY = 'bg-gradient-to-br from-brand-soft via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 min-h-screen pb-24 md:pb-10';

// Shell for the main logged-in pages: full header, phone drawer, bottom nav.
//   variant       : 'me'  (/me: logout confirmation modal)  |  'app' (Matches / Search / Chat: logout is a link)
//   active        : home | matches | search | chat | me   (header + bottom nav highlight)
//   drawer        : (app variant) { items, member?, logout?, logoutDivider? } - each page has its own phone menu
//   mainClassName / mainStyle : <main> differs per page
//   overlays      : modals / toasts rendered after <main>
//   children      : nodes, or a function receiving { askLogout }
export default function MainLayout({
  variant = 'me',
  active,
  drawer,
  mainClassName = 'max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10 animate-fade-in',
  mainStyle,
  overlays,
  children,
}) {
  useBodyClass(BODY);
  const member = CURRENT_MEMBER;
  const isApp = variant === 'app';
  const { signOut } = useAuth();
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
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <FloatingShapes variant={isApp ? 'rich' : 'basic'} />
      <MainHeader member={member} active={active} variant={variant} onLogout={isApp ? signOut : askLogout} onOpenMenu={() => setMenuOpen(true)} />
      <main id="main-content" tabIndex={-1} className={mainClassName} style={mainStyle}>
        {typeof children === 'function' ? children({ askLogout }) : children}
      </main>
      {isApp ? (
        drawer && <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} active={active} member={drawer.member ? member : null} items={drawer.items} logoutTo={drawer.logout ? '/login' : undefined} logoutDivider={drawer.logoutDivider !== false} onLogout={signOut} />
      ) : (
        <>
          <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} active={active} chatBadge={member.unread.chat} onLogout={askLogout} />
          <LogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
        </>
      )}
      {overlays}
      <MobileBottomNav active={active} badges={{ chat: member.unread.chat }} badgeTop="top-1" />
    </>
  );
}
