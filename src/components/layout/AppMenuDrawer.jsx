import { Link, useLocation } from 'react-router-dom';
import Transition from '../ui/Transition.jsx';

const FADE = {
  enter: 'transition ease-out duration-150', enterFrom: 'opacity-0', enterTo: 'opacity-100',
  leave: 'transition ease-in duration-75', leaveFrom: 'opacity-100', leaveTo: 'opacity-0',
};
const SLIDE = {
  enter: 'transition ease-out duration-300', enterFrom: 'translate-x-full', enterTo: 'translate-x-0',
  leave: 'transition ease-in duration-300', leaveFrom: 'translate-x-0', leaveTo: 'translate-x-full',
};
const ITEM = 'flex items-center gap-3 px-4 py-3 rounded-xl';
const IDLE = 'hover:bg-slate-100 dark:hover:bg-slate-800';
const ACTIVE = 'bg-brand-soft dark:bg-brand/10 text-brand font-semibold';

// Standardized phone menu drawer used on every page (slide-in from right, "Menu" header, member card on top).
// The nav list is FIXED here (single source of truth) rather than passed per page, so every page shows the same menu.
//   open     : whether the drawer is shown
//   onClose  : close the drawer
//   member   : when given, shows the gradient member card on top
//   onLogout : handler invoked when Logout is tapped (callers decide: direct sign-out, or open a confirmation modal)
// Highlighting is driven by the current route: the item whose `to` matches the pathname is active.
const FIXED_ITEMS = [
  { key: 'me', to: '/me', icon: 'fa-user', label: 'My Profile' },
  { key: 'dashboard', to: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { key: 'settings', to: '/profile-security', icon: 'fa-cog', label: 'Settings' },
];

export default function AppMenuDrawer({ open, onClose, member, onLogout }) {
  const { pathname } = useLocation();
  return (
    <Transition show={open} {...FADE} className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Transition show={open} {...SLIDE} className="absolute right-0 top-0 bottom-0 w-80 glass-strong p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading font-bold">Menu</h3>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center" aria-label="Close"><i aria-hidden="true" className="fas fa-times text-xl" /></button>
        </div>
        {member && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl">{member.firstName[0]}</div>
              <div>
                <div className="font-bold">{member.firstName} {member.lastName}</div>
                <div className="text-xs opacity-80">{member.memberId} • {member.tier} Member</div>
              </div>
            </div>
          </div>
        )}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto hide-scrollbar">
          {FIXED_ITEMS.map((item) => (
            <Link key={item.key} to={item.to} onClick={onClose} className={`${ITEM} ${pathname === item.to ? ACTIVE : IDLE}`}>
              <i aria-hidden="true" className={`fas ${item.icon} w-5`} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
        <button type="button" onClick={() => { onLogout?.(); onClose(); }} className={`${ITEM} w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-auto`}>
          <i aria-hidden="true" className="fas fa-sign-out-alt w-5" /> Logout
        </button>
      </Transition>
    </Transition>
  );
}
