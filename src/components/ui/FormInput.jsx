// Label + .form-input, using the exact classes from the original pages.
// labelClassName: some pages use a slightly different label style (e.g. slate-600 / mb-2)
const DEFAULT_LABEL = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

export default function FormInput({ id, label, labelClassName = DEFAULT_LABEL, className = '', ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>{label}</label>
      <input id={id} className={`form-input ${className}`.trim()} {...inputProps} />
    </div>
  );
}
