import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import SettingRow from '../../../components/ui/SettingRow.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
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

  const setFlag = (key) => (value) => setPrivacy((p) => ({ ...p, [key]: value }));

  function unblockUser(id) {
    if (window.confirm('Are you sure you want to unblock this user? They will be able to see your profile again.')) {
      setBlocked((list) => list.filter((u) => u.id !== id));
      showToast('User Unblocked', 'The user has been successfully unblocked.', 'success', { duration: 3000 });
    }
  }

  function saveSettings() {
    // TODO: call the API here
    showToast('Settings Saved', 'Your privacy and security preferences have been updated.', 'success', { duration: 3000 });
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
            <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <img loading="lazy" decoding="async" src={user.image} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" alt={user.name} />
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-white">{user.name}</div>
                  <div className="text-xs text-slate-500">{`Blocked: ${user.date}`}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => unblockUser(user.id)}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-brand hover:text-white hover:border-brand transition"
              >
                Unblock
              </button>
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
