import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

// Header used by the logged-in "account" pages: brand (not a link), page subtitle,
// theme toggle and a back arrow. `mobileBrand` is the short brand shown on phones.
export default function AccountHeader({ subtitle, backTo = '/me' }) {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-brand-gradient">
              <i aria-hidden="true" className="fas fa-heart" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-slate-800 dark:text-white">Telugu Sambandham</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1">{subtitle}</span>
            </div>
            <span className="sm:hidden font-heading font-bold text-lg text-slate-800 dark:text-white">TS</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle ariaLabel="Toggle dark mode" />
            <Link to={backTo} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center" aria-label="Go back">
              <i aria-hidden="true" className="fas fa-arrow-left text-slate-600 dark:text-slate-300" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
