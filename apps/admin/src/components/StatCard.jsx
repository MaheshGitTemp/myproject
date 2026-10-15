import { Link } from 'react-router-dom';

// A single KPI tile for the dashboard. When `to` is provided the whole card
// becomes a link (used for the pending-approvals quick link).
export default function StatCard({ label, value, hint, to, accent = false }) {
  const body = (
    <div
      className={[
        'rounded-xl bg-white p-5 shadow-sm ring-1 transition-shadow',
        accent ? 'ring-brand/40' : 'ring-slate-200',
        to ? 'hover:shadow-md' : '',
      ].join(' ')}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={['mt-2 text-3xl font-semibold', accent ? 'text-brand' : 'text-slate-900'].join(' ')}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded-xl">
        {body}
      </Link>
    );
  }
  return body;
}
