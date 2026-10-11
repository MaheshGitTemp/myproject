// Applied-filter chip row. Shows a removable chip for every filter whose value
// differs from DEFAULT_FILTERS. The age range collapses into a single chip that
// resets both ends when removed. Pagination keys (page/limit) are never shown.
const EXCLUDE = new Set(['page', 'limit', 'ageFrom', 'ageTo']);

// How each key's value renders as a chip label.
const LABEL = {
  gender: (v) => (v === 'Female' ? 'Bride' : v === 'Male' ? 'Groom' : v),
  maritalStatus: (v) => v,
  heightFrom: (v) => `Height ${v}`,
  caste: (v) => v,
  rasi: (v) => v,
  nakshatra: (v) => v,
  education: (v) => v,
  occupation: (v) => v,
  country: (v) => v,
  state: (v) => v,
  city: (v) => v,
  annualIncome: (v) => v,
};

const CHIP = 'filter-chip inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
const CLOSE = 'w-6 h-6 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-brand hover:bg-brand/10 dark:hover:bg-brand/20 transition active:scale-[0.9]';

export default function ActiveFilters({ form, defaults, onRemove, onClearAll }) {
  const chips = [];

  // Combined age chip (only when either end differs from its default).
  if (form.ageFrom !== defaults.ageFrom || form.ageTo !== defaults.ageTo) {
    chips.push({ key: 'age', label: `Age ${form.ageFrom}-${form.ageTo}` });
  }

  Object.keys(LABEL).forEach((key) => {
    const value = form[key];
    if (EXCLUDE.has(key)) return;
    const changed = String(value ?? '') !== String(defaults[key] ?? '');
    if (!changed || !String(value ?? '').trim()) return;
    chips.push({ key, label: LABEL[key](value) });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2 animate-fade-in">
      {chips.map((c) => (
        <span key={c.key} className={CHIP}>
          <span>{c.label}</span>
          <button
            type="button"
            onClick={() => onRemove(c.key)}
            aria-label={`Remove filter ${c.label}`}
            className={CLOSE}
          >
            <i aria-hidden="true" className="fas fa-times text-xs" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="filter-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap bg-brand/10 dark:bg-brand/20 text-brand active:scale-[0.97] transition"
      >
        <i aria-hidden="true" className="fas fa-times-circle" /> Clear all
      </button>
    </div>
  );
}
