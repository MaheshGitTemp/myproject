import { Link } from 'react-router-dom';

export function Loading() {
  return (
    <div className="glass rounded-3xl p-12 card-shadow text-center" role="status" aria-live="polite">
      <i aria-hidden="true" className="fas fa-circle-notch fa-spin text-3xl text-brand mb-4" />
      <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
    </div>
  );
}

export function NotFound({ noId, requestedId }) {
  return (
    <div className="glass rounded-3xl p-10 card-shadow text-center max-w-lg mx-auto animate-bounce-in">
      <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4"><i aria-hidden="true" className="fas fa-user-slash text-3xl text-brand" /></div>
      <h1 className="text-2xl font-heading font-bold mb-2">{noId ? 'No profile selected' : 'Profile not found'}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {noId ? 'Search by Profile ID or use the filters to find a profile.' : `We couldn't find a profile with ID ${requestedId}. Please check the ID and try again.`}
      </p>
      <Link to="/search" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition"><i aria-hidden="true" className="fas fa-search" /> Back to Search</Link>
    </div>
  );
}

export function LoadError({ onRetry }) {
  return (
    <div className="glass rounded-3xl p-10 card-shadow text-center max-w-lg mx-auto" role="alert">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><i aria-hidden="true" className="fas fa-triangle-exclamation text-3xl text-red-500" /></div>
      <h1 className="text-2xl font-heading font-bold mb-2">Couldn't load this profile</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Please check your connection and try again.</p>
      <button type="button" onClick={onRetry} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition"><i aria-hidden="true" className="fas fa-rotate-right" /> Try again</button>
    </div>
  );
}
