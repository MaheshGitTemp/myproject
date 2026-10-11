import { Link } from 'react-router-dom';

const ITEMS = [
  { key: 'home', to: '/', icon: 'fa-home', label: 'Home' },
  { key: 'matches', to: '/matches', icon: 'fa-heart', label: 'Matches' },
  { key: 'search', to: '/search', icon: 'fa-search', label: 'Search' },
  { key: 'chat', to: '/chat', icon: 'fa-comment-dots', label: 'Chat' },
  { key: 'me', to: '/me', icon: 'fa-user', label: 'Me' },
];
// Notifications / Proposals show Dashboard in the last slot instead of Me
const DASHBOARD_ITEM = { key: 'dashboard', to: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' };

// Mobile-only bottom navigation.
// active : key of the highlighted item (home | matches | search | chat | me)
// badges : unread counts by key, e.g. { chat: 5 }
// lastItem: 'me' (default) or 'dashboard'
// badgeTop : vertical offset of the badge ('top-0' on most pages, 'top-1' on Me / Matches / Search / Chat)
export default function MobileBottomNav({ active = 'me', badges = {}, badgeTop = 'top-0', lastItem = 'me' }) {
  const items = lastItem === 'dashboard' ? [...ITEMS.slice(0, -1), DASHBOARD_ITEM] : ITEMS;
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-slate-200/50 dark:border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {items.map((item) => {
          const isActive = item.key === active;
          const badge = badges[item.key];
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item${isActive ? ' nav-item-active' : ''} flex flex-col items-center gap-1 py-2 px-3${isActive ? '' : ' text-slate-400'}${badge ? ' relative' : ''}`}
            >
              <i aria-hidden="true" className={`fas ${item.icon} text-xl transition-transform`} />
              {badge && (
                <span className={`absolute ${badgeTop} right-2 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center`}>{badge}</span>
              )}
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
