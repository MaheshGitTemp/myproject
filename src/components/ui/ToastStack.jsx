// Renders the list from useToastStack(): same markup/classes as the original Matches page.
export default function ToastStack({ toasts, onClose }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className="toast-enter glass-strong rounded-2xl p-4 shadow-2xl border-l-4 flex items-start gap-3 border-green-500">
          <i aria-hidden="true" className="fas fa-check-circle text-xl text-green-500" />
          <div className="flex-1">
            <div className="font-bold text-sm">{t.title}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{t.message}</div>
          </div>
          <button type="button" onClick={() => onClose(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><i aria-hidden="true" className="fas fa-times" /></button>
        </div>
      ))}
    </div>
  );
}
