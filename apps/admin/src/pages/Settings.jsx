import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPut } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

// Settings — GET /admin/settings -> { ok, settings:{ key:value } }.
// Save issues one PUT /admin/settings { key, value } per CHANGED key.
const FIELDS = [
  { key: 'contact_unlock_price', label: 'Contact unlock price', type: 'number', hint: 'Price to unlock a contact.' },
  { key: 'contact_unlock_free_until', label: 'Contact unlock free until', type: 'date', hint: 'Free unlocks through this date.' },
  { key: 'phone_view_daily_limit', label: 'Phone views per day', type: 'number', hint: 'Daily phone-reveal cap per member.' },
  { key: 'max_photos_per_user', label: 'Max photos per user', type: 'number', hint: 'Upload limit per member.' },
];

// The API stores dates as full ISO strings; a <input type="date"> needs YYYY-MM-DD.
function toDateInput(value) {
  if (!value) return '';
  const str = String(value);
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return str.slice(0, 10);
}

export default function Settings() {
  const toast = useToast();
  const [initial, setInitial] = useState({}); // last-saved values (strings)
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet('/admin/settings');
      const settings = res?.settings ?? {};
      const next = {};
      for (const f of FIELDS) {
        const raw = settings[f.key] ?? '';
        next[f.key] = f.type === 'date' ? toDateInput(raw) : raw == null ? '' : String(raw);
      }
      setInitial(next);
      setForm(next);
    } catch (err) {
      setError(err?.message || 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const changed = FIELDS.filter((f) => form[f.key] !== initial[f.key]);
    if (changed.length === 0) {
      toast.info('No changes to save.');
      return;
    }
    setSaving(true);
    try {
      for (const f of changed) {
        await apiPut('/admin/settings', { key: f.key, value: form[f.key] });
        toast.success(`Saved ${f.label}.`);
      }
      await load();
    } catch (err) {
      toast.error(err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading settings…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const dirty = FIELDS.some((f) => form[f.key] !== initial[f.key]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-brand-dark">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Platform pricing and limits.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="mb-1 block text-sm font-medium text-slate-700">
              {f.label}
            </label>
            <input
              id={f.key}
              type={f.type}
              value={form[f.key] ?? ''}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {f.hint ? <p className="mt-1 text-xs text-slate-400">{f.hint}</p> : null}
          </div>
        ))}

        <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {dirty ? <span className="text-xs text-amber-600">Unsaved changes</span> : null}
        </div>
      </form>
    </div>
  );
}
