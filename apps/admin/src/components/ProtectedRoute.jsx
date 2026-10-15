import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Guards the admin area:
//  - while the initial /auth/me is in flight -> spinner
//  - anonymous -> redirect to /login
//  - logged-in member who is NOT an admin -> Access Denied panel
//  - admin -> render the protected tree
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-soft">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-soft px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-brand-dark">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">
            This account does not have admin access. Sign in with an administrator account to continue.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
}
