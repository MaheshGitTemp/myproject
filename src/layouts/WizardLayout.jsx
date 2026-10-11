import { Link, Outlet } from 'react-router-dom';
import FloatingShapes from '../components/layout/FloatingShapes.jsx';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx';

// Shell for the Register page: top-aligned narrow <main>, mobile bottom nav, bottom padding.
export default function WizardLayout() {
  return (
    <div className="bg-gradient-to-br from-brand-soft via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 min-h-screen pb-safe-nav md:pb-10">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <FloatingShapes />
      <Header
        subtitle="Create Your Profile"
        plainLogo
        actions={
          <Link to="/login" className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 sm:bg-brand sm:hover:bg-brand-dark text-brand sm:text-white rounded-xl font-semibold text-sm sm:text-base sm:shadow-sm transition">
            <i aria-hidden="true" className="fas fa-right-to-bracket" /> Login
          </Link>
        }
      />
      <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        <Outlet />
      </main>
      <MobileBottomNav active="me" badges={{ chat: 5 }} />
      <Footer />
    </div>
  );
}
