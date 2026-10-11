import { STEP_LABELS } from './options.js';

export default function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-800 dark:text-white">Create Your Profile</span>
        <span className="text-sm font-semibold text-brand">{`Step ${currentStep} of ${totalSteps}`}</span>
      </div>
      <div className="flex gap-2 mb-2">
        {STEP_LABELS.map((label, idx) => (
          <div
            key={label}
            className={`h-2 flex-1 rounded-full transition-all duration-500 ${currentStep >= idx + 1 ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        {STEP_LABELS.map((label, idx) => {
          const isActive = idx + 1 === currentStep;
          const isDone = currentStep > idx + 1;
          return (
            <span
              key={label}
              className={[
                isDone || isActive ? 'text-brand' : '',
                // On xs: hide inactive labels to prevent overflow; show all on sm+
                isActive ? '' : 'hidden sm:inline',
              ].join(' ').trim()}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
