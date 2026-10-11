import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; 2026 Telugu Sambandham. All rights reserved.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/help-support" className="hover:text-brand transition">Help &amp; Support</Link>
          <Link to="/terms-privacy" className="hover:text-brand transition">Terms &amp; Privacy</Link>
          <Link to="/membership" className="hover:text-brand transition">Membership</Link>
        </nav>
      </div>
    </footer>
  );
}
