import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileById, isValidId, normalizeId, profileUrl } from '../../../../services/profileLookupService.js';

// "Search by Profile ID": validates, looks the profile up, then opens it.
export default function ProfileIdSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const id = normalizeId(query);
    if (!id) { setError('Please enter a Profile ID.'); return; }
    if (!isValidId(id)) { setError('Invalid Profile ID. It looks like MAT2087.'); return; }
    setQuery(id); setError(''); setBusy(true);
    const result = await getProfileById(id);
    if (result.status === 'not_found') {
      setBusy(false);
      setError(`No profile found with ID ${id}. Please check the ID and try again.`);
      return;
    }
    // found (or lookup unavailable: the profile page shows its own retry state)
    navigate(profileUrl(id));
  }

  return (
    <div className="glass rounded-3xl p-5 md:p-6 card-shadow mb-6 animate-slide-up">
      <form onSubmit={submit} noValidate className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1">
          <label htmlFor="profile-id" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Search by Profile ID</label>
          <div className="relative">
            <i aria-hidden="true" className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-id" type="text" value={query} maxLength={14} autoComplete="off" autoCapitalize="characters" spellCheck={false}
              onChange={(e) => { setQuery(e.target.value.toUpperCase()); setError(''); }}
              className="form-input pl-11" placeholder="e.g., MAT2087 or 2087"
              aria-invalid={error ? 'true' : 'false'} aria-describedby="profile-id-help"
            />
          </div>
          <p id="profile-id-help" role="status" aria-live="polite" className={`text-xs mt-2 ${error ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
            {error || 'Enter a Profile ID to open that profile directly.'}
          </p>
        </div>
        <button type="submit" disabled={busy} className="md:mt-7 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition flex items-center justify-center gap-2 disabled:opacity-70">
          {!busy && <i aria-hidden="true" className="fas fa-user-check" />}
          {busy && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
          <span>{busy ? 'Opening...' : 'View Profile'}</span>
        </button>
      </form>
    </div>
  );
}
