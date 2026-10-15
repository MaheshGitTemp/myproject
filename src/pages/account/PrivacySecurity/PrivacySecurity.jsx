// Privacy & Security wiring (FEAT-002):
//   WIRED to the backend:
//     - "Hide Contact Information" (hideContact) -> users.hide_phone + users.hide_email
//       via accountService.getPrivacy() (seed on mount) and
//       accountService.updatePrivacy({hidePhone:v, hideEmail:v}) (toggle / Save).
//     - "Blocked Profiles" list -> GET /api/blocks (matchesService.getBlocks);
//       Unblock -> DELETE /api/blocks/:matId (matchesService.unblock).
//   LOCAL-ONLY (not yet persisted — no backend): hideProfile, blurPhotos,
//     incognito, emailNotifs, smsNotifs, marketing, twoFactor, loginAlerts.
//     These toggles keep their state in-memory only; INITIAL_BLOCKED is the
//     USE_MOCK_FALLBACK seed for the blocked list.
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SettingRow from '../../../components/ui/SettingRow.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { getPrivacy, updatePrivacy } from '../../../services/accountService.js';
import { getBlocks, unblock } from '../../../services/matchesService.js';
import { INITIAL_BLOCKED, INITIAL_PRIVACY, SECTIONS } from './privacyData.js';

export default function PrivacySecurity() {
  usePageMeta({
    title: 'Privacy & Security | Telugu Sambandham',
    description: 'Control who can see your photos and contact details on Telugu Sambandham.',
    robots: 'noindex, nofollow',
  });
  const { showToast } = useToast();
  const [privacy, setPrivacy] = useState(INITIAL_PRIVACY);
  const [blocked, setBlocked] = useState(INITIAL_BLOCKED);
  const [confirmUnblockId, setConfirmUnblockId] = useState(null);

  // Seed the WIRED pieces from the backend on mount. The hideContact toggle
  // reflects (hidePhone || hideEmail); the blocked list comes from /api/blocks.
  useEffect(() => {
    let active = true;
    (async () => {
      const { hidePhone, hideEmail } = await getPrivacy();
      if (active) setPrivacy((p) => ({ ...p, hideContact: !!(hidePhone || hideEmail) }));
    })();
    (async () => {
      const { results } = await getBlocks();
      if (!active) return;
      if (Array.isArray(results) && results.length) {
        setBlocked(
          results.map((card) => ({
            id: card.matId,
            matId: card.matId,
            name: card.name,
            image: card.image,
            date: card.blockedAt,
          })),
        );
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist the single hideContact toggle to BOTH hide_phone + hide_email; the
  // other keys are local-only (see the file header comment).
  async function persistHideContact(value) {
    const res = await updatePrivacy({ hidePhone: value, hideEmail: value });
    if (res.ok) {
      showToast('Settings Saved', 'Your contact visibility preference has been updated.', 'success', { duration: 3000 });
    } else {
      showToast('Save Failed', 'Could not update your contact visibility. Please try again.', 'error', { duration: 3000 });
    }
  }

  const setFlag = (key) => (value) => {
    setPrivacy((p) => ({ ...p, [key]: value }));
    if (key === 'hideContact') persistHideContact(value);
  };

  function unblockUser(id) {
    setConfirmUnblockId(id);
  }

  async function confirmUnblock() {
    const target = blocked.find((u) => u.id === confirmUnblockId);
    const id = confirmUnblockId;
    setConfirmUnblockId(null);
    const res = target && target.matId ? await unblock(target.matId) : { ok: true };
    if (res.ok) {
      setBlocked((list) => list.filter((u) => u.id !== id));
      showToast('User Unblocked', 'The user has been successfully unblocked.', 'success', { duration: 3000 });
    } else {
      showToast('Unblock Failed', 'Could not unblock this user. Please try again.', 'error', { duration: 3000 });
    }
  }

  function saveSettings() {
    // Only the hideContact toggle is persisted (-> users.hide_phone/hide_email);
    // the remaining toggles are local-only until a backend lands for them.
    persistHideContact(privacy.hideContact);
  }

  return (
    <AccountLayout
      subtitle="Privacy & Security"
      title={<>Privacy &amp; <span className="gradient-text">Security</span></>}
      description="Control who sees your profile and keep your account secure."
      sidebarActive="profile-security"
      sidebarVariant="compact"
    >
      {SECTIONS.map((section) => (
        <div key={section.title} className="glass rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i aria-hidden="true" className={`fas ${section.icon} text-brand`} /> {section.title}
          </h3>
          <div className="space-y-5">
            {section.rows.map((row, i) => (
              <Fragment key={row.key}>
                {i > 0 && <hr className="border-slate-200 dark:border-slate-700" />}
                <SettingRow title={row.title} description={row.description} checked={privacy[row.key]} onChange={setFlag(row.key)} />
              </Fragment>
            ))}
            {section.withPasswordLink && (
              <>
                <hr className="border-slate-200 dark:border-slate-700" />
                <Link to="/change-password" className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-white group-hover:text-brand transition">Change Password</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your password regularly for security.</div>
                  </div>
                  <i aria-hidden="true" className="fas fa-chevron-right text-slate-400 group-hover:text-brand transition" />
                </Link>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Blocked Profiles */}
      <div className="glass rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-ban text-red-500" /> Blocked Profiles
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{`${blocked.length} Blocked`}</span>
        </div>

        {blocked.length === 0 && (
          <div className="text-center py-8">
            <i aria-hidden="true" className="fas fa-user-check text-4xl text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">You haven't blocked anyone yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {blocked.map((user) => (
            <div key={user.id} className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img loading="lazy" decoding="async" src={user.image} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" alt={user.name} />
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-white">{user.name}</div>
                    <div className="text-xs text-slate-500">{`Blocked: ${user.date}`}</div>
                  </div>
                </div>
                {confirmUnblockId !== user.id && (
                  <button
                    type="button"
                    onClick={() => unblockUser(user.id)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-brand hover:text-white hover:border-brand transition"
                  >
                    Unblock
                  </button>
                )}
              </div>
              {confirmUnblockId === user.id && (
                <div className="flex items-center justify-between gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-sm">
                  <span className="text-slate-700 dark:text-slate-200 text-xs">Unblock this user? They&apos;ll see your profile again.</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => setConfirmUnblockId(null)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
                    <button type="button" onClick={confirmUnblock} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">Confirm</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button type="button" onClick={saveSettings} className="px-8 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition transform hover:scale-105 flex items-center gap-2">
          <i aria-hidden="true" className="fas fa-save" /> Save Changes
        </button>
      </div>
    </AccountLayout>
  );
}
