import { useEffect, useRef, useState } from 'react';
import { DRAG_COMMIT_PX, DRAG_HINT_PX, SWIPE_MS } from '../homeData.js';

const BTN = 'rounded-full flex items-center justify-center hover:scale-110 transition quick-action';

// The card stack plus the three round buttons. Drag (mouse or touch) or press the buttons.
// The dragged transform is written straight to the card element, as the original does, so dragging
// does not re-render on every pointer move.
export default function SwipeDeck({ profiles, onDone, onReset, onInfo }) {
  const [direction, setDirection] = useState(null); // 'left' | 'right' | null
  const cardRef = useRef(null);
  const startX = useRef(null);
  const timer = useRef(null);
  const profile = profiles[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  function swipe(dir) {
    setDirection(dir);
    timer.current = setTimeout(() => {
      onDone();
      setDirection(null);
      if (cardRef.current) cardRef.current.style.transform = ''; // next card starts centred (the original left it displaced after a drag)
    }, SWIPE_MS);
  }

  const x = (e) => (e.type.includes('mouse') ? e.clientX : e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX);
  function start(e) { startX.current = x(e); }
  function move(e) {
    if (startX.current == null) return;
    const diff = x(e) - startX.current;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.05}deg)`;
      setDirection(diff > DRAG_HINT_PX ? 'right' : diff < -DRAG_HINT_PX ? 'left' : null);
    }
  }
  function end(e) {
    if (startX.current == null) return;
    const diff = x(e) - startX.current;
    if (Math.abs(diff) > DRAG_COMMIT_PX) {
      swipe(diff > 0 ? 'right' : 'left');
    } else {
      if (cardRef.current) cardRef.current.style.transform = '';
      setDirection(null);
    }
    startX.current = null;
  }

  return (
    <>
      <div className="flex-1 relative flex items-center justify-center">
        {profiles.length === 0 ? (
          <div className="text-center p-8 glass rounded-3xl card-shadow animate-bounce-in">
            <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4"><i aria-hidden="true" className="fas fa-check-circle text-3xl text-brand" /></div>
            <h3 className="text-xl font-bold mb-2">You've seen all profiles!</h3>
            <p className="text-slate-500 mb-6 text-sm">Check back later for new matches or adjust your filters.</p>
            <button type="button" onClick={onReset} className="px-6 py-3 bg-brand text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition hover:scale-105">Start Over</button>
          </div>
        ) : (
          <div className="relative w-full max-w-md aspect-[3/4]">
            <div className="absolute inset-0 glass rounded-3xl card-shadow transform scale-95 translate-y-4 opacity-50" />
            <div
              ref={cardRef}
              className={`absolute inset-0 glass rounded-3xl card-shadow overflow-hidden swipe-card${direction === 'right' ? ' swiping-right' : direction === 'left' ? ' swiping-left' : ''}`}
              onTouchStart={start} onTouchMove={move} onTouchEnd={end}
              onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            >
              <img loading="lazy" decoding="async" src={profile.image} className="w-full h-full object-cover" alt={profile.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <h2 className="text-3xl font-heading font-bold mb-1"><span>{profile.name}</span>, <span>{profile.age}</span></h2>
                <p className="text-white/90 flex items-center gap-2 mb-3"><i aria-hidden="true" className="fas fa-map-marker-alt text-brand-light" /> <span>{profile.location}</span></p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold"><i aria-hidden="true" className="fas fa-briefcase mr-1" /><span>{profile.job}</span></span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold"><i aria-hidden="true" className="fas fa-graduation-cap mr-1" /><span>{profile.education}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-6 mt-8" style={profiles.length > 0 ? undefined : { display: 'none' }}>
        <button type="button" onClick={() => swipe('left')} className={`w-16 h-16 ${BTN} bg-white dark:bg-slate-800 text-red-500 shadow-lg text-2xl`} aria-label="Close"><i aria-hidden="true" className="fas fa-times" /></button>
        <button type="button" onClick={() => profile && onInfo(profile)} className={`w-12 h-12 ${BTN} bg-white dark:bg-slate-800 text-blue-500 shadow-lg text-xl`} aria-label="More information"><i aria-hidden="true" className="fas fa-info" /></button>
        <button type="button" onClick={() => swipe('right')} className={`w-16 h-16 ${BTN} bg-brand text-white shadow-lg shadow-brand/40 text-2xl`} aria-label="Like"><i aria-hidden="true" className="fas fa-heart" /></button>
      </div>
    </>
  );
}
