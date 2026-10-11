// "Matches of the Day" — a horizontally scrollable row of top-compatibility profiles.
// Tapping a card opens the profile detail page via `onOpen(profile)`.
export default function MatchStrip({ profiles, onOpen }) {
  if (!profiles?.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i aria-hidden="true" className="fas fa-star text-gold" /> Matches of the Day
      </h2>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(p)}
            className="w-44 sm:w-48 flex-shrink-0 glass rounded-2xl card-shadow card-hover overflow-hidden text-left active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-200 dark:bg-slate-700">
              <img loading="lazy" decoding="async" src={p.image} className="w-full h-full object-cover object-top" alt={p.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                <i aria-hidden="true" className="fas fa-heart text-gold text-[10px]" />
                <span className="text-white text-[11px] font-bold">{p.compatibility?.score}/{p.compatibility?.total}</span>
              </div>
              {p.online && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-full shadow">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="text-white text-[10px] font-bold">Online</span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                <h3 className="font-heading font-bold text-base leading-tight">
                  {p.name}, {p.age}
                </h3>
                {p.compatibility?.label && (
                  <p className="text-gold text-[11px] font-semibold mt-0.5">{p.compatibility.label}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
