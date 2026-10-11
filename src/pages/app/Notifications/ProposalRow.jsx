import { Link } from 'react-router-dom';

const STATUS_CLASS = { pending: 'status-pending', accepted: 'status-accepted', rejected: 'status-rejected' };
const VIEW = 'px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-xs font-bold rounded-lg transition-colors';

// One proposal. `onAccept` / `onReject` are only passed for the Received tab.
export default function ProposalRow({ proposal, onAccept, onReject }) {
  const p = proposal;
  const profileUrl = `/profile-details?id=MAT${p.matId}`;
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
        <Link to={profileUrl} className="flex-shrink-0">
          <img loading="lazy" decoding="async" src={p.image} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm" alt={p.name} />
        </Link>
        <div>
          <Link to={profileUrl} className="font-bold text-slate-800 dark:text-white hover:text-brand transition-colors text-base">{p.name}</Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">MAT{p.matId} • {p.age} yrs • {p.location}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_CLASS[p.status]}`}>{p.status}</span>
        {onAccept && p.status === 'pending' ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => onAccept(p)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"><i aria-hidden="true" className="fas fa-check" /> Accept</button>
            <button type="button" onClick={() => onReject(p)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"><i aria-hidden="true" className="fas fa-times" /> Reject</button>
          </div>
        ) : (
          <Link to={profileUrl} className={VIEW}>View Profile</Link>
        )}
      </div>
    </div>
  );
}
