import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiGet, apiPost, apiDelete } from '../api.js';
import { config } from '../config.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

// Member detail — GET /admin/users/:matId.
// user = { ...profileDetail(name, fullName, age, gender, city, state,
//          education, occupation, caste, phone, email, ...), preferences,
//          status, emailVerified, phoneVerified, isVerified, adminApproved,
//          adminBlockCount, createdAt, lastLoginAt,
//          photos:[{id,status,isPrimary}], counts:{blocksMade,blockedBy} }
function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value === null || value === undefined || value === '' ? '—' : String(value)}</dd>
    </div>
  );
}

function YesNo({ value }) {
  return <span className={value ? 'text-green-700' : 'text-slate-500'}>{value ? 'Yes' : 'No'}</span>;
}

export default function MemberDetail() {
  const { matId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet(`/admin/users/${matId}`);
      setUser(res?.user ?? null);
    } catch (err) {
      setError(err?.message || 'Could not load this member.');
    } finally {
      setLoading(false);
    }
  }, [matId]);

  useEffect(() => {
    load();
  }, [load]);

  // Runs a mutating action then refetches. `label` doubles as the busy key.
  const runAction = async (label, fn, successMsg) => {
    setActionBusy(label);
    try {
      await fn();
      toast.success(successMsg);
      await load();
    } catch (err) {
      toast.error(err?.message || 'Action failed.');
    } finally {
      setActionBusy('');
    }
  };

  const approve = () =>
    runAction('approve', () => apiPost(`/admin/profiles/${matId}/approve`), `Approved ${matId}.`);

  const suspend = () => {
    const reason = window.prompt('Reason for suspending? (optional)');
    if (reason === null) return;
    runAction('suspend', () => apiPost(`/admin/users/${matId}/suspend`, { reason }), 'Member suspended.');
  };

  const unsuspend = () =>
    runAction('unsuspend', () => apiPost(`/admin/users/${matId}/unsuspend`), 'Member reactivated.');

  const block = (type) =>
    runAction(`block:${type}`, () => apiPost(`/admin/users/${matId}/block`, { type }), `Blocked (${type}).`);

  const unblock = () =>
    runAction('unblock', () => apiPost(`/admin/users/${matId}/unblock`), 'Admin block removed.');

  const doDelete = async () => {
    setActionBusy('delete');
    try {
      await apiDelete(`/admin/users/${matId}`);
      toast.success(`Deleted ${matId}.`);
      navigate('/members', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Delete failed.');
      setActionBusy('');
      setConfirmDelete(false);
    }
  };

  if (loading) return <Spinner label="Loading member…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!user) return <ErrorState message="Member not found." />;

  const name = user.fullName || user.name || matId;
  const isPending = user.status === 'pending_approval';
  const isSuspended = user.status === 'suspended';
  const busy = !!actionBusy;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/members" className="text-sm text-brand hover:underline">
          ← Back to members
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {user.image ? (
          <img src={user.image} alt={name} className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-xl font-semibold text-brand">
            {String(name).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">{name}</h1>
          <p className="text-sm text-slate-500">
            {user.matId || matId} · {user.age ? `${user.age} yrs` : '—'} · {user.gender || '—'}
          </p>
        </div>
        <StatusBadge status={user.status} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        {isPending ? (
          <button
            type="button"
            disabled={busy}
            onClick={approve}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {actionBusy === 'approve' ? 'Approving…' : 'Approve'}
          </button>
        ) : null}

        {isSuspended ? (
          <button
            type="button"
            disabled={busy}
            onClick={unsuspend}
            className="rounded-lg border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            {actionBusy === 'unsuspend' ? 'Working…' : 'Unsuspend'}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={suspend}
            className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            {actionBusy === 'suspend' ? 'Working…' : 'Suspend'}
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => block('full')}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {actionBusy === 'block:full' ? 'Working…' : 'Block (full)'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => block('message_only')}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {actionBusy === 'block:message_only' ? 'Working…' : 'Block (messages)'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={unblock}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {actionBusy === 'unblock' ? 'Working…' : 'Unblock'}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirmDelete(true)}
          className="ml-auto rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Account */}
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Account</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Email verified" value={<YesNo value={user.emailVerified} />} />
            <Field label="Phone verified" value={<YesNo value={user.phoneVerified} />} />
            <Field label="Verified" value={<YesNo value={user.isVerified} />} />
            <Field label="Admin approved" value={<YesNo value={user.adminApproved} />} />
            <Field label="Admin block count" value={user.adminBlockCount ?? 0} />
            <Field label="Joined" value={fmtDate(user.createdAt)} />
            <Field label="Last login" value={fmtDate(user.lastLoginAt)} />
          </dl>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Blocks</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Blocks made" value={user.counts?.blocksMade ?? 0} />
              <Field label="Blocked by" value={user.counts?.blockedBy ?? 0} />
            </dl>
          </div>
        </section>

        {/* Profile */}
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Profile</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Marital status" value={user.maritalStatus} />
            <Field label="Mother tongue" value={user.motherTongue} />
            <Field label="Education" value={user.education} />
            <Field label="Occupation" value={user.occupation} />
            <Field label="City" value={user.city} />
            <Field label="State" value={user.state} />
            <Field label="Caste" value={user.caste} />
            <Field label="Sub caste" value={user.subCaste} />
            <Field label="Phone" value={user.phone} />
            <Field label="Email" value={user.email} />
          </dl>
          {user.about ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">About</dt>
              <dd className="mt-1 text-sm text-slate-700">{user.about}</dd>
            </div>
          ) : null}
        </section>
      </div>

      {/* Photos */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Photos ({user.photos?.length ?? 0})
        </h2>
        {user.photos && user.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {user.photos.map((ph) => (
              <div key={ph.id} className="overflow-hidden rounded-lg ring-1 ring-slate-200">
                <img
                  src={`${config.API_BASE}/photos/file/${ph.id}?variant=thumb`}
                  alt={`Photo ${ph.id}`}
                  className="h-28 w-full object-cover"
                  loading="lazy"
                />
                <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
                  <span>{ph.status}</span>
                  {ph.isPrimary ? <span className="font-medium text-brand">Primary</span> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No photos uploaded.</p>
        )}
      </section>

      <ConfirmModal
        open={confirmDelete}
        title={`Delete ${matId}?`}
        message="This permanently removes the member and all their data. This cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        busy={actionBusy === 'delete'}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
