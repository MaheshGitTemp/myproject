// Label + <select class="form-input">. options: strings, or {value, label}. `children` render under the select.
// labelClassName: some pages use a slightly different label style (e.g. slate-600 / mb-2)
const DEFAULT_LABEL = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

export default function SelectField({ id, label, labelClassName = DEFAULT_LABEL, options, className = '', children, ...selectProps }) {
  return (
    <div>
      {label && <label htmlFor={id} className={labelClassName}>{label}</label>}
      <select id={id} className={`form-input${className ? ` ${className}` : ''}`} {...selectProps}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
      {children}
    </div>
  );
}
