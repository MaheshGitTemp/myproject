import { Link } from 'react-router-dom';

// Account navigation shared by the account pages. Desktop: a list. Phones: a scrolling row of pills.
// The original pages are NOT identical here, so there are three variants:
//   full            Dashboard, Edit Profile, Gallery, Change Password: grouped list with headings
//   compact         Privacy & Security: 3 items, no headings
//   compact-legacy  Close Account: like compact, but with its own older pill style
const ITEM = {
  dashboard: { to: '/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  'edit-profile': { to: '/edit-profile', icon: 'fa-user-edit', label: 'Edit Profile' },
  gallery: { to: '/gallery', icon: 'fa-images', label: 'Gallery' },
  'profile-security': { to: '/profile-security', icon: 'fa-shield-alt', label: 'Privacy & Security' },
  'change-password': { to: '/change-password', icon: 'fa-key', label: 'Change Password' },
  'help-support': { to: '/help-support', icon: 'fa-question-circle', label: 'Help & Support' },
  'close-account': { to: '/close-account', icon: 'fa-user-slash', label: 'Close Account', danger: true },
};

const GROUPS = [
  { heading: 'My Account', keys: ['dashboard'], headingClass: 'px-4 py-2 mt-2' },
  { heading: 'Profile', keys: ['edit-profile', 'gallery'], headingClass: 'px-4 py-2 mt-4' },
  { heading: 'Account & Settings', keys: ['profile-security', 'change-password'], headingClass: 'px-4 py-2 mt-4' },
  { heading: 'Help', keys: ['help-support'], headingClass: 'px-4 py-2 mt-4' },
];

const COMPACT_KEYS = ['profile-security', 'change-password', 'close-account'];
const COMPACT_ICON = { 'close-account': 'fa-times' };

// Pill rows (the labels differ from page to page in the original HTML).
export const PILLS = {
  dashboard: [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'edit-profile', label: 'Edit Profile' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'profile-security', label: 'Privacy', icon: 'fa-shield-alt' },
    { key: 'close-account', label: 'Close', icon: 'fa-times' },
  ],
  profile: [
    { key: 'edit-profile', label: 'Edit Profile' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'profile-security', label: 'Privacy', icon: 'fa-shield-alt' },
    { key: 'change-password', label: 'Password' },
    { key: 'close-account', label: 'Close', icon: 'fa-times' },
  ],
  security: [
    { key: 'profile-security', label: 'Privacy & Security' },
    { key: 'change-password', label: 'Change Password' },
    { key: 'close-account', label: 'Close Account', icon: 'fa-times' },
  ],
  close: [
    { key: 'profile-security', label: 'Privacy', icon: 'fa-shield-alt' },
    { key: 'change-password', label: 'Password' },
    { key: 'close-account', label: 'Close Account', icon: 'fa-times' },
  ],
};
export const DASHBOARD_PILLS = PILLS.dashboard;

const DEFAULT_PILLS = { full: PILLS.dashboard, compact: PILLS.security, 'compact-legacy': PILLS.close };

const INACTIVE = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
const DESKTOP_SHAPE = 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left';

function desktopClass(item, active, hover = true) {
  if (active) return `section-nav-item active ${DESKTOP_SHAPE}`;
  if (item.danger) return `section-nav-item ${DESKTOP_SHAPE} ${INACTIVE} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`;
  return `section-nav-item ${DESKTOP_SHAPE} ${INACTIVE} text-slate-600 dark:text-slate-300${hover ? ' hover:bg-brand-soft dark:hover:bg-slate-700 hover:text-brand' : ''}`;
}

function chipClass(item, active) {
  const shape = 'section-nav-item flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all';
  if (active) return `section-nav-item active ${shape.replace('section-nav-item ', '')}`;
  return `${shape} ${INACTIVE} ${item.danger ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`;
}

function legacyClass(active) {
  const shape = 'flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all';
  return active ? `${shape} bg-brand text-white shadow-md` : `${shape} ${INACTIVE} text-slate-600 dark:text-slate-300`;
}

export default function AccountSidebar({ active, variant = 'full', pills }) {
  const rows = pills || DEFAULT_PILLS[variant];
  const compact = variant !== 'full';
  const close = ITEM['close-account'];

  return (
    <aside className="lg:w-64 flex-shrink-0">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col gap-2 sticky top-24">
        {compact ? (
          COMPACT_KEYS.map((key) => (
            <Link key={key} to={ITEM[key].to} className={desktopClass(ITEM[key], key === active, false)}>
              <i aria-hidden="true" className={`fas ${COMPACT_ICON[key] || ITEM[key].icon} w-5 text-center`} />
              <span>{ITEM[key].label}</span>
            </Link>
          ))
        ) : (
          <>
            {GROUPS.map((group) => (
              <div key={group.heading} className="contents">
                <h2 className={`text-xs font-bold text-slate-400 uppercase tracking-wider ${group.headingClass}`}>{group.heading}</h2>
                {group.keys.map((key) => (
                  <Link key={key} to={ITEM[key].to} className={desktopClass(ITEM[key], key === active)}>
                    <i aria-hidden="true" className={`fas ${ITEM[key].icon} w-5 text-center`} />
                    <span>{ITEM[key].label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700 my-2 mx-4" />
            <Link to={close.to} className={desktopClass(close, active === 'close-account')}>
              <i aria-hidden="true" className={`fas ${close.icon} w-5 text-center`} />
              <span>{close.label}</span>
            </Link>
          </>
        )}
      </nav>

      {/* Mobile Horizontal Scroll */}
      <div className="lg:hidden flex overflow-x-auto hide-scrollbar gap-2 pb-4 mb-4">
        {rows.map((p) => {
          const item = ITEM[p.key];
          const icon = p.icon || item.icon;
          const isActive = p.key === active;
          if (variant === 'compact-legacy') {
            return (
              <Link key={p.key} to={item.to} className={legacyClass(isActive)}>
                <i aria-hidden="true" className={`fas ${icon} mr-1`} /> {p.label}
              </Link>
            );
          }
          return (
            <Link key={p.key} to={item.to} className={chipClass(item, isActive)}>
              <i aria-hidden="true" className={`fas ${icon}`} /> {p.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
