import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';

// Members — GET /admin/users?query=&status=&page=&limit=.
// Shape: { ok, results:[{ matId, email, phone, status, isVerified,
//          adminApproved, premium, name, city, state, createdAt }], total, page, limit }
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending_otp', label: 'Pending OTP' },
];

const LIMIT = 20;

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function Members() {
  const navigate = useNavigate();

  // `search` is the live input; `query` is the applied term used for fetching.
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ results: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      const res = await apiGet(`/admin/users?${params.toString()}`);
      setData({ results: res?.results ?? [], total: res?.total ?? 0 });
    } catch (err) {
      setError(err?.message || 'Could not load members.');
    } finally {
      setLoading(false);
    }
  }, [query, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const onStatusChange = (e) => {
    setPage(1);
    setStatus(e.target.value);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-brand-dark">Members</h1>
        <p className="mt-1 text-sm text-slate-500">Search, filter and open any member.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={applySearch} className="flex flex-1 gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or Mat ID"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={onStatusChange}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading members…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.results.length === 0 ? (
        <EmptyState title="No members found" message="Try a different search or filter." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mat ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map((m) => (
                  <tr
                    key={m.matId}
                    onClick={() => navigate(`/members/${m.matId}`)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-brand">{m.matId}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {m.name || '—'}
                      {m.premium ? (
                        <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                          Premium
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.isVerified ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {[m.city, m.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}
