import Transition from '../ui/Transition.jsx';

const FADE = {
  enter: 'transition ease-out duration-150', enterFrom: 'opacity-0', enterTo: 'opacity-100',
  leave: 'transition ease-in duration-75', leaveFrom: 'opacity-100', leaveTo: 'opacity-0',
};
const POP = { enter: 'transition ease-out duration-300', enterFrom: 'opacity-0 scale-95', enterTo: 'opacity-100 scale-100' };

export default function LogoutModal({ open, onCancel, onConfirm }) {
  return (
    <Transition show={open} {...FADE} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm modal-backdrop" onClick={onCancel} />
      <Transition show={open} {...POP} className="relative w-full max-w-sm glass-strong rounded-3xl p-6 shadow-2xl modal-content-desktop text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i aria-hidden="true" className="fas fa-sign-out-alt text-2xl" />
        </div>
        <h3 className="text-xl font-heading font-bold mb-2">Logout?</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Are you sure you want to logout from your account?</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/30">Yes, Logout</button>
        </div>
      </Transition>
    </Transition>
  );
}
