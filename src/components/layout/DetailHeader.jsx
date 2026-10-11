import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

// Header for detail pages: back arrow, brand link (to Home), small subtitle, theme toggle.
// onBack runs instead of following the link (the link is the fallback destination).
export default function DetailHeader({ subtitle, backTo = '/search', onBack }) {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link to={backTo} onClick={(e) => { e.preventDefault(); onBack?.(); }} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center" aria-label="Go back">
              <i aria-hidden="true" className="fas fa-arrow-left text-slate-600 dark:text-slate-300" />
            </Link>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-brand-gradient">
                <i aria-hidden="true" className="fas fa-heart" />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-lg text-slate-800 dark:text-white">Telugu Sambandham</span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1">{subtitle}</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle ariaLabel="Toggle dark mode" />
          </div>
        </div>
      </div>
    </header>
  );
}
