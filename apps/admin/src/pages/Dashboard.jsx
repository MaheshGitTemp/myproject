import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

// Dashboard — KPI cards from GET /admin/stats.
// Response shape: { ok, stats: { totalMembers, pendingApproval, active,
// suspended, pendingPhotos, signupsToday, unlocksToday } }
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/admin/stats');
      setStats(data?.stats ?? null);
    } catch (err) {
      setError(err?.message || 'Could not load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <ErrorState message="No stats available." onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-dark">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total members" value={stats.totalMembers ?? 0} />
        <StatCard
          label="Pending approval"
          value={stats.pendingApproval ?? 0}
          hint="Review in Moderation →"
          to="/moderation"
          accent
        />
        <StatCard label="Active" value={stats.active ?? 0} />
        <StatCard label="Suspended" value={stats.suspended ?? 0} />
        <StatCard
          label="Pending photos"
          value={stats.pendingPhotos ?? 0}
          hint="Review in Moderation →"
          to="/moderation"
        />
        <StatCard label="Signups today" value={stats.signupsToday ?? 0} />
        <StatCard label="Unlocks today" value={stats.unlocksToday ?? 0} />
      </div>
    </div>
  );
}
