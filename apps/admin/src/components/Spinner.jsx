export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-slate-500 ${className}`}>
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
