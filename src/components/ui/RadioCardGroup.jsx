// Label + grid of "radio cards" (styles in styles/pages/register.css: .radio-card).
export default function RadioCardGroup({ label, name, options, value, onChange, gridClass, spanClass = '' }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className={gridClass}>
        {options.map((opt) => (
          <label key={opt.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only radio-card"
            />
            <div className="flex items-center justify-center p-3 border border-slate-200 dark:border-slate-600 rounded-xl transition-all hover:border-brand/50">
              <span className={`text-sm font-semibold${spanClass ? ` ${spanClass}` : ''}`}>{opt.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
