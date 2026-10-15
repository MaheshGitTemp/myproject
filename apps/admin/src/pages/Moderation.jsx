import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api.js';
import { config } from '../config.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

// Moderation — GET /admin/pending.
// Shape: { ok, pendingUsers:[{mat_id,email,phone,status,created_at,first_name,
//          last_name,full_name}], pendingPhotos:[{id,user_id,mat_id,created_at}] }
function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function memberName(u) {
  if (u.full_name) return u.full_name;
  const joined = [u.first_name, u.last_name].filter(Boolean).join(' ');
  return joined || '—';
}

export default function Moderation() {
  const toast = useToast();
  const [data, setData] = useState({ pendingUsers: [], pendingPhotos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null); // tracks the in-flight action target

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet('/admin/pending');
      setData({
        pendingUsers: res?.pendingUsers ?? [],
        pendingPhotos: res?.pendingPhotos ?? [],
      });
    } catch (err) {
      setError(err?.message || 'Could not load the moderation queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approveMember = async (matId) => {
    setBusyId(`member:${matId}`);
    try {
      await apiPost(`/admin/profiles/${matId}/approve`);
      toast.success(`Approved ${matId}.`);
      await load();
    } catch (err) {
      toast.error(err?.message || 'Approve failed.');
    } finally {
      setBusyId(null);
    }
  };

  const approvePhoto = async (id) => {
    setBusyId(`photo:${id}`);
    try {
      await apiPost(`/admin/photos/${id}/approve`);
      toast.success('Photo approved.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Approve failed.');
    } finally {
      setBusyId(null);
    }
  };

  const rejectPhoto = async (id) => {
    const reason = window.prompt('Reason for rejecting this photo? (optional)');
    if (reason === null) return; // cancelled
    setBusyId(`photo:${id}`);
    try {
      await apiPost(`/admin/photos/${id}/reject`, { reason });
      toast.success('Photo rejected.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Reject failed.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner label="Loading moderation queue…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { pendingUsers, pendingPhotos } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-brand-dark">Moderation</h1>
        <p className="mt-1 text-sm text-slate-500">Approve members and photos awaiting review.</p>
      </div>

      {/* Pending members */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pending members ({pendingUsers.length})
        </h2>
        {pendingUsers.length === 0 ? (
          <EmptyState title="No members awaiting approval" message="New sign-ups will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mat ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map((u) => (
                  <tr key={u.mat_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.mat_id}</td>
                    <td className="px-4 py-3 text-slate-700">{memberName(u)}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/members/${u.mat_id}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          disabled={busyId === `member:${u.mat_id}`}
                          onClick={() => approveMember(u.mat_id)}
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-60"
                        >
                          {busyId === `member:${u.mat_id}` ? 'Approving…' : 'Approve'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending photos */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pending photos ({pendingPhotos.length})
        </h2>
        {pendingPhotos.length === 0 ? (
          <EmptyState title="No photos awaiting review" message="Uploaded photos will appear here." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pendingPhotos.map((ph) => (
              <div key={ph.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <img
                  src={`${config.API_BASE}/photos/file/${ph.id}?variant=thumb`}
                  alt={`Pending photo for ${ph.mat_id}`}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
                <div className="space-y-2 p-3">
                  <Link to={`/members/${ph.mat_id}`} className="block text-xs font-medium text-brand hover:underline">
                    {ph.mat_id}
                  </Link>
                  <p className="text-xs text-slate-400">{fmtDate(ph.created_at)}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === `photo:${ph.id}`}
                      onClick={() => approvePhoto(ph.id)}
                      className="flex-1 rounded-lg bg-brand px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === `photo:${ph.id}`}
                      onClick={() => rejectPhoto(ph.id)}
                      className="flex-1 rounded-lg border border-red-300 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
