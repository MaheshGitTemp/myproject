import { useRef } from 'react';
import StepNav from './StepNav.jsx';

const EXTRA_SLOTS = [1, 2, 3, 4, 5];
const TIPS = [
  'Use a clear, well-lit face shot as your main profile picture.',
  'Avoid group photos, heavy filters, or sunglasses.',
  'Upload a mix of close-ups and full-length traditional/casual photos.',
];

export default function Step6Photos({ onBack }) {
  const fileInputRef = useRef(null);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <>
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-1">Upload Your Photos</h2>
        <p className="text-slate-500 dark:text-slate-400">Profiles with photos get 10x more matches! Upload up to 6 photos.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="sr-only"
        onChange={(e) => {
          // TODO: wire to upload handler
          console.log('Selected files:', e.target.files);
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Main Photo Slot */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-square rounded-2xl border-2 border-dashed border-brand bg-brand-soft/30 dark:bg-brand/10 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-soft/50 transition group"
        >
          <i aria-hidden="true" className="fas fa-user-circle text-3xl text-brand mb-2 group-hover:scale-110 transition" />
          <span className="text-xs font-bold text-brand">Main Photo *</span>
          <span className="text-[10px] text-slate-500 mt-1">{isTouchDevice ? 'Tap to upload' : 'Click to upload'}</span>
        </div>

        {/* Additional Photo Slots */}
        {EXTRA_SLOTS.map((n) => (
          <div key={n} onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-brand-soft/20 transition group">
            <i aria-hidden="true" className="fas fa-plus text-2xl text-slate-400 mb-1 group-hover:text-brand transition" />
            <span className="text-xs font-semibold text-slate-500">Add Photo</span>
          </div>
        ))}
      </div>

      <div className="bg-gold/10 dark:bg-gold/10 border border-gold/30 rounded-xl p-4 flex items-start gap-3 mt-6">
        <i aria-hidden="true" className="fas fa-crown text-gold text-xl mt-0.5" />
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">Pro Tips for Best Results</p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
            {TIPS.map((tip) => (
              <li key={tip}><i aria-hidden="true" className="fas fa-check text-green-500 mr-1" /> {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <StepNav onBack={onBack} submit />
    </>
  );
}
