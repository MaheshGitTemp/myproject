import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../../components/ui/PasswordInput.jsx';
import Transition from '../../../components/ui/Transition.jsx';
import { closeAccount, deactivateAccount } from '../../../services/accountService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import '../../../styles/pages/close-account.css';

const REASONS = [
  { value: '', label: 'Select a reason...' },
  { value: 'found_partner', label: 'I found a partner through Telugu Sambandham! 🎉' },
  { value: 'taking_break', label: "I'm taking a break from matrimony" },
  { value: 'privacy', label: 'I have privacy concerns' },
  { value: 'technical', label: "I'm facing technical issues" },
  { value: 'other', label: 'Other reasons' },
];

const LOSSES = [
  'All your uploaded photos and gallery data',
  'Your match history, shortlists, and chat messages',
  'Any active Premium subscription (No refunds)',
  'Your MAT ID will be permanently retired',
];

export default function CloseAccount() {
  usePageMeta({
    title: 'Close Account | Telugu Sambandham',
    description: 'Deactivate or permanently delete your Telugu Sambandham account.',
    robots: 'noindex, nofollow',
  });
  const navigate = useNavigate();
  const { member, signOut } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function handleDeactivate() {
    if (!reason) {
      showToast('Reason Required', 'Please select a reason for deactivation.', 'error', { duration: 4000, icon: 'fa-times-circle' });
      return;
    }
    await deactivateAccount();
    showToast('Account Deactivated', 'Your profile is now hidden. Log in anytime to reactivate.', 'success', { duration: 4000 });
    signOut();
    navigate('/login');
  }

  function openDeleteModal() {
    if (!password) {
      setPasswordError('Password is required to confirm deletion.');
      return;
    }
    setPasswordError('');
    setShowModal(true);
  }

  async function performDelete() {
    // NOTE: the "Confirm your password" field + checkbox are a client-only
    // confirmation gate for this irreversible action. The pre-existing
    // /account/close endpoint deletes the authenticated user from the session
    // and does NOT re-verify the entered password (re-auth on delete would be
    // a backend contract change, out of scope here).
    setShowModal(false);
    await closeAccount();
    showToast('Account Deleted', 'Your account has been scheduled for permanent deletion.', 'success', { duration: 4000 });
    // Original redirected to the home page after 3s. The account is gone, so the session ends too.
    setTimeout(() => { signOut(); navigate('/'); }, 3000);
  }

  const modal = (
    <Transition
      show={showModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      enter="transition ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100"
      leave="transition ease-in duration-75" leaveFrom="opacity-100" leaveTo="opacity-0"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative glass-strong rounded-3xl p-6 max-w-md w-full shadow-2xl animate-bounce-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i aria-hidden="true" className="fas fa-exclamation-triangle text-3xl text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Final Confirmation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Are you absolutely sure you want to permanently delete your Telugu Sambandham account?
            <br /><br />
            <strong className="text-red-600">This cannot be undone.</strong>
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition">
              Keep Account
            </button>
            <button type="button" onClick={performDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-500/30">
              Yes, Delete It
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );

  return (
    <AccountLayout
      pageClass="page-close-account"
      subtitle="Account Management"
      title={<>Close <span className="gradient-text">Account</span></>}
      description="We're sad to see you go. Choose an option below to manage your account status."
      sidebarActive="close-account"
      sidebarVariant="compact-legacy"
      badges={{ chat: member?.unread?.chat ?? 0 }}
      overlays={modal}
    >
      {/* Option 1: Deactivate (Temporary) */}
      <div className="glass rounded-2xl p-6 card-shadow border-l-4 border-l-blue-500">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <i aria-hidden="true" className="fas fa-pause-circle text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Deactivate Account (Temporary)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hide your profile from search results. You can reactivate anytime by logging in.</p>
          </div>
        </div>

        <div className="space-y-4 pl-0 md:pl-16">
          <div>
            <label htmlFor="reason-for-deactivating" className="form-label">Reason for deactivating</label>
            <select id="reason-for-deactivating" value={reason} onChange={(e) => setReason(e.target.value)} className="form-input">
              {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button type="button" onClick={handleDeactivate} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <i aria-hidden="true" className="fas fa-pause" /> Deactivate My Profile
          </button>
        </div>
      </div>

      {/* Option 2: Delete (Permanent) */}
      <div className="glass rounded-2xl p-6 card-shadow border-l-4 border-l-red-500">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <i aria-hidden="true" className="fas fa-trash-alt text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Account (Permanent)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Permanently erase your profile, photos, and messages. This action cannot be undone.</p>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 ml-0 md:ml-16">
          <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-2 flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-exclamation-triangle" /> What you will lose:
          </h4>
          <ul className="text-xs text-red-600 dark:text-red-300 space-y-1.5 list-disc list-inside">
            {LOSSES.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>

        {/* Deletion Form */}
        <div className="space-y-4 pl-0 md:pl-16">
          <PasswordInput
            id="confirm-your-password"
            label="Confirm your password"
            labelClassName="form-label"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your current password"
            className={passwordError ? '!border-red-500' : ''}
            toggleLabel="Toggle password visibility"
            smoothToggle={false}
          >
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
          </PasswordInput>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)} className="custom-checkbox mt-0.5" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              I understand that deleting my account is <strong className="text-red-600 dark:text-red-400">permanent</strong> and all my data will be erased within 30 days.
            </span>
          </label>

          <button
            type="button"
            onClick={openDeleteModal}
            disabled={!confirmDelete || !password}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            <i aria-hidden="true" className="fas fa-trash-alt" /> Permanently Delete Account
          </button>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="glass rounded-2xl p-6 card-shadow text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Having issues or just need a break? Talk to us first.</p>
        <Link to="/help-support" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition text-sm">
          <i aria-hidden="true" className="fas fa-headset" /> Contact Support Team
        </Link>
      </div>
    </AccountLayout>
  );
}
