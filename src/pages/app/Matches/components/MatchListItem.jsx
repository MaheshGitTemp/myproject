// List-view row. Note: the original list view has no dark-mode classes on its chips; kept as is.
export default function MatchListItem({ profile: p, index, mutual, onOpen, onRemove, onMessage }) {
  return (
    <div onClick={() => onOpen(p)} className="list-card glass rounded-2xl overflow-hidden card-shadow flex flex-col md:flex-row items-stretch cursor-pointer" style={{ animation: `slideUp 0.4s ease-out ${index * 0.05}s both` }}>
      <div className="relative md:w-48 flex-shrink-0 overflow-hidden">
        <img loading="lazy" decoding="async" src={p.image} className="w-full h-48 md:h-full object-cover object-top" alt={p.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {mutual && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-lg">
              <i aria-hidden="true" className="fas fa-heart text-white text-[10px]" />
              <span className="text-white text-[10px] font-bold">Mutual</span>
            </div>
          )}
          {p.online && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full online-dot" />
              <span className="text-white text-[10px] font-bold">Online</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-heading font-bold flex items-center gap-2">
                <span>{p.name}</span>, <span>{p.age}</span>
                {p.verified && <i aria-hidden="true" className="fas fa-check-circle text-green-500 text-sm" />}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><i aria-hidden="true" className="fas fa-map-marker-alt text-brand" /><span>{`${p.location}, ${p.state}`}</span></p>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 rounded-full text-xs font-semibold text-brand"><i aria-hidden="true" className="fas fa-users" /><span>{p.caste}</span></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-leaf mr-1" />Pure Veg</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-briefcase mr-1" /><span>{p.job}</span></span>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-star mr-1" /><span>{p.rasi}</span></span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300 mb-3">
            <span className="flex items-center gap-1.5"><i aria-hidden="true" className="fas fa-ruler-vertical text-brand/70" /><span>{p.height}</span></span>
            <span className="flex items-center gap-1.5"><i aria-hidden="true" className="fas fa-graduation-cap text-brand/70" /><span>{p.education}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><i aria-hidden="true" className="far fa-clock" /><span>{p.lastActive}</span></div>
        </div>
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(p.uid); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl font-semibold text-sm transition flex items-center gap-2 quick-action"><i aria-hidden="true" className="far fa-trash-alt" /><span className="hidden sm:inline">Remove</span></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMessage(p); }} className="flex-1 md:flex-none px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand/30 transition flex items-center justify-center gap-2 quick-action"><i aria-hidden="true" className="far fa-comment-dots" /> Message</button>
        </div>
      </div>
    </div>
  );
}
