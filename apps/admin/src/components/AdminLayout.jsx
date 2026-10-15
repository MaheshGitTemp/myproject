import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/moderation', label: 'Moderation' },
  { to: '/members', label: 'Members' },
  { to: '/settings', label: 'Settings' },
  { to: '/audit', label: 'Audit Log' },
];

function navClass({ isActive }) {
  return [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.matId || 'Admin';

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-brand-soft lg:flex">
      {/* Mobile backdrop */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-brand-dark px-4 py-6 transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="mb-8 px-2">
          <p className="text-lg font-semibold text-white">Telugu Sambandham</p>
          <p className="text-xs uppercase tracking-wide text-gold">Admin Panel</p>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass} onClick={closeMobile}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:min-h-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Signed in as <span className="font-medium text-slate-900">{adminName}</span>
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
