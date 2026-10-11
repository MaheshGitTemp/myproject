import { Children, Fragment } from 'react';

// Glass card with an icon heading; children are separated by the thin divider used in the original.
export default function SettingsCard({ icon, iconClass = 'text-brand', title, children }) {
  const rows = Children.toArray(children);
  return (
    <div className="glass rounded-2xl p-6 card-shadow">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <i aria-hidden="true" className={`fas ${icon} ${iconClass}`} /> {title}
      </h3>
      <div className="space-y-5">
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <hr className="border-slate-200 dark:border-slate-700" />}
            {row}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
