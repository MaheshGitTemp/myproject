import { Outlet } from 'react-router-dom';
import FloatingShapes from '../components/layout/FloatingShapes.jsx';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';

// Shared shell for Login / Forgot password style pages:
// gradient background, floating shapes, header, centred <main>, footer.
export default function AuthLayout() {
  return (
    <div className="bg-gradient-to-br from-brand-soft via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <FloatingShapes />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center p-4 sm:p-8 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
