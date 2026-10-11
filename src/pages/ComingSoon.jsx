import { Link, useLocation } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';

// Temporary placeholder for pages that have not been converted yet.
export default function ComingSoon() {
  const { pathname } = useLocation();
  usePageMeta({ title: 'Coming soon | Telugu Sambandham' });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-sans text-slate-700">
      <p>
        <code>{pathname}</code> has not been converted to React yet.
      </p>
      <Link to="/login" className="text-brand font-semibold hover:underline">Back to Log In</Link>
    </div>
  );
}
