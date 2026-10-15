export default function EmptyState({ title = 'Nothing here yet', message = '', children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      {children}
    </div>
  );
}
