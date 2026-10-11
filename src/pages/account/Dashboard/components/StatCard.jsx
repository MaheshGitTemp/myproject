export default function StatCard({ label, value, icon, iconClass, bgClass }) {
  return (
    <div className="glass rounded-2xl p-5 card-shadow text-center">
      <div className={`w-12 h-12 mx-auto ${bgClass} rounded-full flex items-center justify-center mb-3`}>
        <i aria-hidden="true" className={`fas ${icon} ${iconClass} text-xl`} />
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}
