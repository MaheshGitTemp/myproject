// Small coloured pill for a user's account status.
const STYLES = {
  active: 'bg-green-50 text-green-700 ring-green-200',
  pending_approval: 'bg-amber-50 text-amber-700 ring-amber-200',
  pending_otp: 'bg-slate-100 text-slate-600 ring-slate-200',
  suspended: 'bg-red-50 text-red-700 ring-red-200',
  closed: 'bg-slate-200 text-slate-600 ring-slate-300',
};

const LABELS = {
  active: 'Active',
  pending_approval: 'Pending approval',
  pending_otp: 'Pending OTP',
  suspended: 'Suspended',
  closed: 'Closed',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-200';
  const label = LABELS[status] || status || 'unknown';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
      {label}
    </span>
  );
}
