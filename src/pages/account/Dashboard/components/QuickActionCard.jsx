import { Link } from 'react-router-dom';

export default function QuickActionCard({ to, icon, title, note, colorClass, noteClass, extraClass = '' }) {
  return (
    <Link to={to} className={`glass rounded-2xl p-4 card-shadow hover:scale-[1.02] transition-transform flex flex-col items-center text-center group${extraClass ? ` ${extraClass}` : ''}`}>
      <i aria-hidden="true" className={`fas ${icon} ${colorClass} text-2xl mb-2 group-hover:scale-110 transition-transform`} />
      <span className="font-bold text-sm text-slate-800 dark:text-white">{title}</span>
      <span className={`text-xs ${noteClass} font-semibold mt-1`}>{note}</span>
    </Link>
  );
}
