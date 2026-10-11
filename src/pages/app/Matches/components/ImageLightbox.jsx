import { useEffect, useRef, useState } from 'react';

// Full-screen, swipeable image viewer that sits ABOVE the profile modal (z-[60] over z-50).
// Self-contained: seeded from `index`, it owns its own current-index + navigation state so
// the grid only has to say "open at index N". Mounts/unmounts conditionally from Body, so a
// simple animate-fade-in entry is enough (reduced motion is handled globally in main.css).
// Touch-swipe mirrors SwipeDeck.jsx (clientX from touches/changedTouches, horizontal-only).
const SWIPE_PX = 50;

export default function ImageLightbox({ images, index, name, onClose }) {
  const imgs = images || [];
  const len = imgs.length;
  const many = len > 1;
  const [i, setI] = useState(index);
  const startX = useRef(null);
  const startY = useRef(null);

  const go = (dir) => setI((n) => (n + dir + len) % len);

  // Capture-phase keydown so Escape closes THIS lightbox before the modal's bubble-phase
  // Escape listener can fire (stopPropagation prevents a double-close). Arrows navigate.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (many && e.key === 'ArrowLeft') {
        setI((n) => (n - 1 + len) % len);
      } else if (many && e.key === 'ArrowRight') {
        setI((n) => (n + 1) % len);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [len, many, onClose]);

  const touchStart = (e) => {
    startX.current = e.touches?.[0]?.clientX ?? null;
    startY.current = e.touches?.[0]?.clientY ?? null;
  };
  const touchEnd = (e) => {
    if (!many || startX.current == null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? startX.current;
    const endY = e.changedTouches?.[0]?.clientY ?? startY.current;
    const diffX = endX - startX.current;
    const diffY = endY - (startY.current ?? endY);
    if (Math.abs(diffX) > SWIPE_PX && Math.abs(diffX) > Math.abs(diffY)) {
      go(diffX > 0 ? -1 : 1);
    }
    startX.current = null;
    startY.current = null;
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name || 'Profile'} photos`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-fade-in"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Image wrapper — stops propagation so tapping/swiping the photo never closes the overlay. */}
      <div
        className="relative flex max-h-[100dvh] max-w-full items-center justify-center"
        onClick={stop}
        onTouchStart={touchStart}
        onTouchEnd={touchEnd}
      >
        <img
          key={i}
          src={imgs[i]}
          alt={`${name || 'Profile'} photo ${i + 1}`}
          decoding="async"
          className="max-h-[100dvh] max-w-full h-auto w-auto select-none object-contain animate-fade-in"
        />
      </div>

      {/* Close (top-right). stopPropagation so the backdrop handler does not also run. */}
      <button
        type="button"
        onClick={(e) => { stop(e); onClose(); }}
        aria-label="Close"
        className="glass absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-slate-700 shadow-lg transition active:scale-[0.97] dark:text-white"
      >
        <i aria-hidden="true" className="fas fa-times text-lg" />
      </button>

      {many && (
        <>
          <button
            type="button"
            onClick={(e) => { stop(e); go(-1); }}
            aria-label="Previous photo"
            className="glass absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-700 shadow-lg transition active:scale-[0.97] dark:text-white"
          >
            <i aria-hidden="true" className="fas fa-chevron-left" />
          </button>
          <button
            type="button"
            onClick={(e) => { stop(e); go(1); }}
            aria-label="Next photo"
            className="glass absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-700 shadow-lg transition active:scale-[0.97] dark:text-white"
          >
            <i aria-hidden="true" className="fas fa-chevron-right" />
          </button>

          <div
            className="glass absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-lg dark:text-white"
            onClick={stop}
          >
            {i + 1} / {len}
          </div>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2" onClick={stop}>
            {imgs.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { stop(e); setI(idx); }}
                aria-label={`Go to photo ${idx + 1}`}
                aria-current={idx === i}
                className={`h-2 rounded-full transition-all active:scale-[0.97] ${idx === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
