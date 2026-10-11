import ToggleSwitch from '../../../../components/ui/ToggleSwitch.jsx';

export default function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold text-sm text-slate-800 dark:text-white">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
