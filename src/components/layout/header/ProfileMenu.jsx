import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../../ui/Transition.jsx';
import useClickAway from '../../../hooks/useClickAway.js';

const ANIM = {
  enter: 'transition ease-out duration-200', enterFrom: 'opacity-0 scale-95', enterTo: 'opacity-100 scale-100',
  leave: 'transition ease-in duration-150', leaveFrom: 'opacity-100 scale-100', leaveTo: 'opacity-0 scale-95',
};
const ITEM = 'flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 transition';

// Desktop avatar button + account dropdown.
export default function ProfileMenu({ member, active, highlightProfile = true, onLogout, logoutTo }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickAway(ref, () => setOpen(false), open);

  return (
    <div className="hidden md:block relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
        <img loading="lazy" decoding="async" src={member.photoSmall} className="w-9 h-9 rounded-full object-cover border-2 border-brand" alt="User" />
        <div className="text-left">
          <div className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{member.firstName}</div>
          <div className="text-[10px] text-slate-500 leading-tight">{member.memberId}</div>
        </div>
        <i aria-hidden="true" className="fas fa-chevron-down text-xs text-slate-400 ml-1" />
      </button>
      <Transition show={open} {...ANIM} className="absolute right-0 mt-2 w-64 glass-strong rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
        <div className="p-4 bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">{member.firstName[0]}</div>
            <div>
              <div className="font-bold">{member.firstName} {member.lastName}</div>
              <div className="text-xs opacity-80">{member.memberId} • <i aria-hidden="true" className="fas fa-crown text-gold" /> {member.tier} Member</div>
            </div>
          </div>
        </div>
        <nav className="p-2">
          <Link to="/me" className={highlightProfile && active === 'me' ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand/10 text-brand font-semibold transition' : ITEM}>
            <i aria-hidden="true" className={`fas fa-user w-5${highlightProfile && active === 'me' ? '' : ' text-brand'}`} /> My Profile
          </Link>
          <Link to="/dashboard" className={ITEM}>
            <i aria-hidden="true" className="fas fa-tachometer-alt w-5 text-brand" /> Dashboard
            <span className="ml-auto bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{member.unread.dashboard}</span>
          </Link>
          <Link to="/profile-security" className={ITEM}>
            <i aria-hidden="true" className="fas fa-cog w-5 text-brand" /> Settings
          </Link>
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
          {logoutTo ? (
            <Link to={logoutTo} onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 transition">
              <i aria-hidden="true" className="fas fa-sign-out-alt w-5" /> Logout
            </Link>
          ) : (
            <button type="button" onClick={() => { onLogout(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 transition text-left">
              <i aria-hidden="true" className="fas fa-sign-out-alt w-5" /> Logout
            </button>
          )}
        </nav>
      </Transition>
    </div>
  );
}
