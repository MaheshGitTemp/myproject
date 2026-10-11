import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import NotificationsMenu from './header/NotificationsMenu.jsx';
import ProfileMenu from './header/ProfileMenu.jsx';

export const MAIN_NAV = [
  { key: 'home', to: '/', icon: 'fa-home', label: 'Home' },
  { key: 'matches', to: '/matches', icon: 'fa-heart', label: 'Matches' },
  { key: 'search', to: '/search', icon: 'fa-search', label: 'Search' },
  { key: 'chat', to: '/chat', icon: 'fa-comment-dots', label: 'Chat' },
];

// Full logged-in header (nav links, theme, notifications, profile menu, mobile menu button).
// active: home | matches | search | chat | me
// variant: 'me'  -> /me page (logout opens a confirmation modal, "My Profile" highlighted, lighter shadow)
//          'app' -> Matches / Search / Chat (logout is a plain link, stronger shadow, bounce-in badge)
export default function MainHeader({ member, active, variant = 'me', onLogout, onOpenMenu }) {
  const isApp = variant === 'app';
  return (
    <header className={`sticky top-0 z-40 glass-strong border-b border-slate-200/50 dark:border-slate-700/50 ${isApp ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-brand-gradient">
                <i aria-hidden="true" className="fas fa-heart" />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-lg text-slate-800 dark:text-white">Telugu Sambandham</span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1">Trusted Matrimony for Viswabrahmin Community</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`nav-link${item.key === 'chat' ? ' relative' : ''} px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${active === item.key ? 'bg-brand/10 text-brand' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <i aria-hidden="true" className={`fas ${item.icon}`} /> {item.label}
                {item.key === 'chat' && member.unread.chat > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">{member.unread.chat}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle ariaLabel="Toggle Dark Mode" />
            <NotificationsMenu count={member.unread.notifications} badgeAnimation={isApp ? 'animate-bounce-in' : 'animate-bounce'} />
            <ProfileMenu member={member} active={active} highlightProfile={!isApp} onLogout={onLogout} logoutTo={isApp ? '/login' : undefined} />
            <button type="button" onClick={onOpenMenu} className="md:hidden w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center" aria-label="Open Menu">
              <i aria-hidden="true" className="fas fa-bars text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
