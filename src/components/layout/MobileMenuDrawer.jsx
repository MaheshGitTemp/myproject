import { Link } from 'react-router-dom';
import Transition from '../ui/Transition.jsx';
import { MAIN_NAV } from './MainHeader.jsx';

const ITEM = 'flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition';
const FADE = {
  enter: 'transition ease-out duration-150', enterFrom: 'opacity-0', enterTo: 'opacity-100',
  leave: 'transition ease-in duration-75', leaveFrom: 'opacity-100', leaveTo: 'opacity-0',
};
const SLIDE = {
  enter: 'transition ease-out duration-300', enterFrom: 'translate-x-full', enterTo: 'translate-x-0',
  leave: 'transition ease-in duration-300', leaveFrom: 'translate-x-0', leaveTo: 'translate-x-full',
};

// Phone-only slide-in menu. active: same keys as MainHeader.
export default function MobileMenuDrawer({ open, onClose, active, chatBadge, onLogout }) {
  return (
    <Transition show={open} {...FADE} className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Transition show={open} {...SLIDE} className="absolute right-0 top-0 bottom-0 w-72 glass-strong border-l border-slate-200 dark:border-slate-700 shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <span className="font-heading font-bold text-lg text-slate-800 dark:text-white">Menu</span>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center" aria-label="Close">
            <i aria-hidden="true" className="fas fa-times text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {MAIN_NAV.map((item) => (
            <Link key={item.key} to={item.to} className={ITEM}>
              <i aria-hidden="true" className={`fas ${item.icon} w-5 text-brand`} /> {item.label}
              {item.key === 'chat' && chatBadge > 0 && <span className="ml-auto bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{chatBadge}</span>}
            </Link>
          ))}
          <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
          <Link to="/me" className={active === 'me' ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/10 text-brand font-semibold transition' : ITEM}>
            <i aria-hidden="true" className={`fas fa-user w-5${active === 'me' ? '' : ' text-brand'}`} /> My Profile
          </Link>
          <Link to="/dashboard" className={ITEM}><i aria-hidden="true" className="fas fa-tachometer-alt w-5 text-brand" /> Dashboard</Link>
          <Link to="/profile-security" className={ITEM}><i aria-hidden="true" className="fas fa-cog w-5 text-brand" /> Settings</Link>
        </nav>
        <button type="button" onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-semibold transition mt-auto">
          <i aria-hidden="true" className="fas fa-sign-out-alt w-5" /> Logout
        </button>
      </Transition>
    </Transition>
  );
}
