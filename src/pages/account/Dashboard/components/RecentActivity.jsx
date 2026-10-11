import { Link } from 'react-router-dom';
import { STATUS_CLASS } from '../dashboardData.js';

export default function RecentActivity({ items }) {
  return (
    <div className="lg:col-span-2 glass rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <i aria-hidden="true" className="fas fa-clock-rotate-left text-brand" /> Recent Activity
        </h3>
        <Link to="/notifications" className="text-xs font-semibold text-brand hover:underline">View All</Link>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <img loading="lazy" decoding="async" src={item.photo} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-600" alt={item.alt} />
              <div>
                <div className="font-semibold text-sm text-slate-800 dark:text-white">{item.name}</div>
                <div className="text-xs text-slate-500">{item.meta}</div>
              </div>
            </div>
            <span className={`px-3 py-1 ${STATUS_CLASS[item.status]} text-xs font-bold rounded-full`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
