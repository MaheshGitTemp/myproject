import { useState } from 'react';
import PasswordInput from '../../../components/ui/PasswordInput.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { PILLS } from '../../../components/layout/AccountSidebar.jsx';
import '../../../styles/pages/change-password.css';

const EMPTY = { current: '', newPass: '', confirm: '' };
const LABEL = 'block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2';
const EYE = { toggleLabel: 'Toggle password visibility', smoothToggle: false, autoComplete: 'current-password' };

const REQUIREMENTS = [
  { key: 'length', text: 'At least 8 characters' },
  { key: 'upper', text: 'One uppercase letter' },
  { key: 'number', text: 'One number' },
  { key: 'special', text: 'One special character (recommended)' },
];

function checkRequirements(pwd) {
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
}

export default function ChangePassword() {
  usePageMeta({
    title: 'Change Password | Telugu Sambandham',
    description: 'Change your Telugu Sambandham account password.',
    robots: 'noindex, nofollow',
  });
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const reqs = checkRequirements(form.newPass);
  const mismatch = form.newPass && form.confirm && form.newPass !== form.confirm;
  const isFormValid =
    form.current.length > 0 && form.newPass.length >= 8 && reqs.upper && reqs.number && form.newPass === form.confirm;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid) return;
    // TODO: call the API here (authService.changePassword)
    showToast('Password Updated', 'Your password has been changed successfully.', 'success');
    setForm(EMPTY);
  }

  return (
    <AccountLayout
      subtitle="Change Password"
      title={<>Change <span className="gradient-text">Password</span></>}
      description="Secure your account by updating your password regularly."
      sidebarActive="change-password"
      pills={PILLS.profile}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="glass rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-lock text-brand" /> Update Credentials
          </h3>
          <div className="space-y-5">
            <PasswordInput
              id="current-password"
              label="Current Password *"
              labelClassName={LABEL}
              value={form.current}
              onChange={update('current')}
              placeholder="Enter your current password"
              required
              {...EYE}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PasswordInput
                id="new-password"
                label="New Password *"
                labelClassName={LABEL}
                value={form.newPass}
                onChange={update('newPass')}
                placeholder="Enter new password"
                required
                {...EYE}
              />
              <PasswordInput
                id="confirm-new-password"
                label="Confirm New Password *"
                labelClassName={LABEL}
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="Confirm new password"
                required
                {...EYE}
              >
                {mismatch && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <i aria-hidden="true" className="fas fa-exclamation-circle" /> Passwords do not match
                  </p>
                )}
              </PasswordInput>
            </div>

            {/* NOTE: in the original HTML the two <div>s above were never closed, so the browser put the
                requirements card and the button row INSIDE this block (a card within a card). That nesting
                is kept here so the page looks exactly as it did. */}
            <div className="glass rounded-2xl p-6 card-shadow bg-slate-50/50 dark:bg-slate-800/50">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <i aria-hidden="true" className="fas fa-shield-alt text-brand" /> Password Requirements
              </h4>
              <ul className="space-y-2 text-sm">
                {REQUIREMENTS.map((r) => (
                  <li key={r.key} className={`checklist-item flex items-center gap-2${reqs[r.key] ? ' valid' : ''}`}>
                    <i aria-hidden="true" className={`fas ${reqs[r.key] ? 'fa-check-circle' : 'fa-circle'}`} />
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition transform flex items-center gap-2 ${
                  isFormValid
                    ? 'bg-brand hover:bg-brand-dark text-white shadow-brand/30 hover:scale-[1.02]'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <i aria-hidden="true" className="fas fa-save" /> Update Password
              </button>
            </div>
          </div>
        </div>
      </form>
    </AccountLayout>
  );
}
