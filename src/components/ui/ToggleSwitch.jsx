import './ToggleSwitch.css';

// Same look as the original <div class="toggle-switch">, plus keyboard + screen-reader support.
export default function ToggleSwitch({ checked, onChange, label }) {
  const toggle = () => onChange(!checked);
  return (
    <div
      className={`toggle-switch${checked ? ' active' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      }}
    />
  );
}
