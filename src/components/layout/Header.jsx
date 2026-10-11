import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

// subtitle   : small line under the brand name (Register: "Create Your Profile")
// plainLogo  : logo without the hover-scale effect (Register page original)
// actions    : extra buttons shown next to the theme toggle (Register: Login link)
export default function Header({ subtitle, plainLogo = false, actions }) {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className={`flex items-center gap-3${plainLogo ? '' : ' group'}`}>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-brand-gradient${plainLogo ? '' : ' transition-transform group-hover:scale-105'}`}
            >
              <i aria-hidden="true" className="fas fa-heart" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-slate-800 dark:text-white">Telugu Sambandham</span>
              {subtitle && (
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1">{subtitle}</span>
              )}
            </div>
          </Link>
          {actions ? (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {actions}
            </div>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </div>
    </header>
  );
}
