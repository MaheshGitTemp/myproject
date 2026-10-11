import { Link } from 'react-router-dom';
import Transition from '../ui/Transition.jsx';

const FADE = {
  enter: 'transition ease-out duration-150', enterFrom: 'opacity-0', enterTo: 'opacity-100',
  leave: 'transition ease-in duration-75', leaveFrom: 'opacity-100', leaveTo: 'opacity-0',
};
const ITEM = 'flex items-center gap-3 px-4 py-3 rounded-xl';
const IDLE = 'hover:bg-slate-100 dark:hover:bg-slate-800';
const ACTIVE = 'bg-brand-soft dark:bg-brand/10 text-brand font-semibold';

// Phone menu drawer used by Matches / Search / Chat. Each page passes its own list (they differ in the original).
//   items    : [{ key, to, icon, label, badge? }]
//   active   : key of the highlighted item
//   member   : when given, shows the gradient member card on top
//   logoutTo : when given, shows a Logout link at the bottom (logoutDivider=false: no rule above it, as on Home)
export default function AppMenuDrawer({ open, onClose, items, active, member, logoutTo, logoutDivider = true, onLogout }) {
  return (
    <Transition show={open} {...FADE} className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-80 glass-strong p-6 animate-slide-up overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
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
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link key={item.key} to={item.to} className={`${ITEM} ${item.key === active ? ACTIVE : IDLE}`}>
              <i aria-hidden="true" className={`fas ${item.icon} w-5`} /> {item.label}
              {item.badge ? <span className="ml-auto bg-brand text-white text-xs px-2 py-1 rounded-full">{item.badge}</span> : null}
            </Link>
          ))}
          {logoutTo && (
            <>
              {logoutDivider && <div className="border-t border-slate-200 dark:border-slate-700 my-2" />}
              <Link to={logoutTo} onClick={onLogout} className={`${ITEM} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                <i aria-hidden="true" className="fas fa-sign-out-alt w-5" /> Logout
              </Link>
            </>
          )}
        </nav>
      </div>
    </Transition>
  );
}
