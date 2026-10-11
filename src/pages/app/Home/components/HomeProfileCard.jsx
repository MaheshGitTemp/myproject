// Recommended-feed card. Mirrors the Matches MatchCard visual language, but with Home's
// two actions: secondary "View Profile" (navigate) and primary "Send Interest" (stub that
// toasts and flips to a disabled "Interest Sent" state).
export default function HomeProfileCard({ profile: p, index, interested, onInterest, onView }) {
  return (
    <div
      className="glass rounded-3xl overflow-hidden card-shadow card-hover relative group"
      style={{ animation: `slideUp 0.5s ease-out ${index * 0.08}s both` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-200 dark:bg-slate-700">
        <img loading="lazy" decoding="async" src={p.image} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" alt={p.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {p.premium && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-gold to-gold-light rounded-full shadow-lg">
            <i aria-hidden="true" className="fas fa-crown text-white text-xs" />
            <span className="text-white text-xs font-bold">PREMIUM</span>
          </div>
        )}
        {p.online && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-full shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full online-dot" />
            <span className="text-white text-[10px] font-bold">Online</span>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white z-10">
          <h3 className="text-2xl font-heading font-bold flex items-center gap-2 mb-1">
            <span>{p.name}</span>, <span>{p.age}</span>
          </h3>
          <p className="text-white/90 text-sm flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-map-marker-alt text-brand-light" />
            <span>{`${p.city}, ${p.state}`}</span>
          </p>
        </div>
      </div>
      <div className="p-5 bg-white dark:bg-slate-800">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 dark:bg-brand/20 rounded-full text-xs font-semibold text-brand mb-3">
          <i aria-hidden="true" className="fas fa-users" />
          <span>{p.subCaste ? `${p.caste} · ${p.subCaste}` : p.caste}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-briefcase mr-1" /><span>{p.occupation}</span></span>
          {p.diet && (
            <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-leaf mr-1" /><span>{p.diet}</span></span>
          )}
          {p.rasi && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-star mr-1" /><span>{p.rasi}</span></span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><i aria-hidden="true" className="fas fa-ruler-vertical text-brand/70 w-4" /><span>{p.height}</span></div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><i aria-hidden="true" className="fas fa-graduation-cap text-brand/70 w-4" /><span className="truncate">{p.education}</span></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onView(p)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 quick-action active:scale-[0.97]">
            <i aria-hidden="true" className="fas fa-eye" />
            <span>View Profile</span>
          </button>
          <button
            type="button"
            onClick={() => !interested && onInterest(p)}
            disabled={interested}
            aria-pressed={interested}
            className={`flex-[1.2] py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 quick-action active:scale-[0.97] ${interested ? 'bg-green-600 text-white cursor-default opacity-90' : 'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/30'}`}
          >
            <i aria-hidden="true" className={interested ? 'fas fa-check' : 'fas fa-heart'} />
            <span>{interested ? 'Interest Sent' : 'Send Interest'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
