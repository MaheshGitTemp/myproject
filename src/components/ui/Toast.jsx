import Transition, { ALPINE_DEFAULT } from './Transition.jsx';

export default function Toast({ show, title, message, type, icon, onClose }) {
  const ok = type === 'success';
  const info = type === 'info';
  return (
    <Transition
      show={show}
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 max-w-sm text-slate-800 dark:text-slate-100"
      {...ALPINE_DEFAULT}
    >
      <div
        className={`toast-enter glass-strong rounded-2xl p-4 shadow-2xl border-l-4 flex items-start gap-3 ${ok ? 'border-green-500' : info ? 'border-blue-500' : 'border-red-500'}`}
      >
        <i aria-hidden="true" className={`fas text-xl ${ok ? 'fa-check-circle text-green-500' : info ? 'fa-info-circle text-blue-500' : `${icon || 'fa-exclamation-circle'} text-red-500`}`} />
        <div className="flex-1">
          <div className="font-bold text-sm">{title}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{message}</div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Close">
          <i aria-hidden="true" className="fas fa-times" />
        </button>
      </div>
    </Transition>
  );
}
