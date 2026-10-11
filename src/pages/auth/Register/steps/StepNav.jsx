// Back / Next (or submit) button row shared by steps 3-5.
export default function StepNav({ onBack, onNext, submit = false }) {
  return (
    <div className="flex justify-between pt-4">
      <button type="button" onClick={onBack} className="px-6 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2">
        <i aria-hidden="true" className="fas fa-arrow-left" /> Back
      </button>
      {submit ? (
        <button type="submit" className="px-8 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition transform hover:scale-[1.02] flex items-center gap-2">
          Create Profile <i aria-hidden="true" className="fas fa-check" />
        </button>
      ) : (
        <button type="button" onClick={onNext} className="px-8 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition transform hover:scale-[1.02] flex items-center gap-2">
          Next <i aria-hidden="true" className="fas fa-arrow-right" />
        </button>
      )}
    </div>
  );
}
