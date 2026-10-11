import { useEffect, useState } from 'react';

// State-driven image viewer for the profile modal. A single large main image is
// bound to `photo`; arrows, dots, thumbnails and keyboard nav are the only things
// that mutate it, so they stay in sync by construction. Lives in its own file
// because it is the only stateful, interactive part of the modal.
export default function ProfileGallery({ gallery, online, name }) {
  const imgs = gallery || [];
  const len = imgs.length;
  const [photo, setPhoto] = useState(0);
  const many = len > 1;

  const go = (dir) => setPhoto((n) => (n + dir + len) % len);

  useEffect(() => {
    if (!many) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setPhoto((n) => (n - 1 + len) % len);
      else if (e.key === 'ArrowRight') setPhoto((n) => (n + 1) % len);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [many, len]);

  return (
    <div className="relative flex h-full flex-col bg-slate-100 dark:bg-slate-800">
      <div className="relative w-full flex-1 min-h-0 md:aspect-auto">
        <img
          key={photo}
          loading="lazy"
          decoding="async"
          src={imgs[photo]}
          alt={`${name || 'Profile'} photo ${photo + 1}`}
          className="h-full w-full object-cover object-top transition-opacity duration-300 animate-fade-in"
        />

        {online && (
          <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-green-500 px-3 py-1.5 shadow-lg">
            <span className="online-dot h-2 w-2 rounded-full bg-white" />
            <span className="text-xs font-bold text-white">Online Now</span>
          </div>
        )}

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="glass absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-700 shadow-lg transition active:scale-[0.97] dark:text-white"
            >
              <i aria-hidden="true" className="fas fa-chevron-left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="glass absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-700 shadow-lg transition active:scale-[0.97] dark:text-white"
            >
              <i aria-hidden="true" className="fas fa-chevron-right" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhoto(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === photo}
                  className={`h-2 rounded-full transition-all active:scale-[0.97] ${i === photo ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {many && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar p-3">
          {imgs.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhoto(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === photo}
              className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl transition active:scale-[0.97] ${i === photo ? 'ring-2 ring-brand' : 'opacity-60 hover:opacity-100'}`}
            >
              <img
                loading="lazy"
                decoding="async"
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
