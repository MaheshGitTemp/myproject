import { useState } from 'react';

// Label + password field with the show/hide eye button. `children` render under the field (error text).
// toggleLabel / smoothToggle / labelClassName exist because the original pages differ slightly:
// e.g. some use "Toggle password visibility", have no hover fade on the eye, or a slate-600 / mb-2 label.
const DEFAULT_LABEL = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

export default function PasswordInput({
  id, label, labelClassName = DEFAULT_LABEL, className = '',
  toggleLabel = 'Toggle Password Visibility', smoothToggle = true, children, ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>{label}</label>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} className={`form-input pr-10 ${className}`.trim()} {...inputProps} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200${smoothToggle ? ' transition-colors' : ''}`}
          aria-label={toggleLabel}
        >
          <i aria-hidden="true" className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`} />
        </button>
      </div>
      {children}
    </div>
  );
}
