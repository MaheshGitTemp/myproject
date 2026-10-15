import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';

// Audit log — GET /admin/audit?page=&limit=.
// Shape: { ok, results:[{ id, adminId, adminMatId, action, target, detail,
//          createdAt }], total }
const LIMIT = 20;

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function detailText(detail) {
  if (detail === null || detail === undefined) return '—';
  if (typeof detail === 'string') return detail || '—';
  try {
    const str = JSON.stringify(detail);
    return str === '{}' ? '—' : str;
  } catch {
    return '—';
  }
}

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet(`/admin/audit?page=${page}&limit=${LIMIT}`);
      setData({ results: res?.results ?? [], total: res?.total ?? 0 });
    } catch (err) {
      setError(err?.message || 'Could not load the audit log.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-brand-dark">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-500">Every admin action, newest first.</p>
      </div>

      {loading ? (
        <Spinner label="Loading audit log…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.results.length === 0 ? (
        <EmptyState title="No audit entries yet" message="Admin actions will be recorded here." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{r.adminMatId || r.adminId || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {r.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.target || '—'}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-500" title={detailText(r.detail)}>
                      {detailText(r.detail)}
                    </td>
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
