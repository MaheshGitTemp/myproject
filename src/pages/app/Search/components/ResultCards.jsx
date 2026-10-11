import { idOf } from '../../../../services/profileLookupService.js';

const PLACEHOLDER = 'https://via.placeholder.com/400x500?text=No+Image';
const where = (p) => `${p.city || p.location || ''}, ${p.state || ''}`;
// Cards are links in spirit: click or Enter opens the profile.
const linkProps = (open) => ({ role: 'link', tabIndex: 0, onClick: open, onKeyDown: (e) => { if (e.key === 'Enter') open(); } });

export function ResultGridCard({ profile: p, index, onOpen }) {
  const open = () => onOpen(p);
  return (
    <div className="glass rounded-3xl overflow-hidden card-shadow card-hover relative group cursor-pointer" {...linkProps(open)} style={{ animation: `slideUp 0.5s ease-out ${index * 0.08}s both` }}>
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-200 dark:bg-slate-700">
        <img loading="lazy" decoding="async" alt="Profile photo" src={p.image || PLACEHOLDER} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {p.premium && <span className="px-3 py-1.5 bg-gradient-to-r from-gold to-gold-light rounded-full shadow-lg text-white text-xs font-bold flex items-center gap-1"><i aria-hidden="true" className="fas fa-crown" /> PREMIUM</span>}
        </div>
        {p.online && <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-full shadow-lg"><span className="w-2 h-2 bg-white rounded-full online-dot" /><span className="text-white text-[10px] font-bold">Online</span></div>}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white z-10">
          <h3 className="text-2xl font-heading font-bold mb-1"><span>{p.name || 'Unknown'}</span>, <span>{p.age || 'N/A'}</span></h3>
          <p className="text-white/90 text-sm flex items-center gap-2"><i aria-hidden="true" className="fas fa-map-marker-alt text-brand-light" /><span>{where(p)}</span></p>
        </div>
      </div>
      <div className="p-5 bg-white dark:bg-slate-800">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 dark:bg-brand/20 rounded-full text-xs font-semibold text-brand mb-3"><i aria-hidden="true" className="fas fa-users" /><span>{p.caste || 'Community'}</span></div>
        {' '}
        <span className="ml-2 text-xs font-mono text-slate-400 dark:text-slate-500">{idOf(p)}</span>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-leaf mr-1" />Pure Veg</span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-briefcase mr-1" /><span>{p.occupation || p.job || 'N/A'}</span></span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); open(); }} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-brand/10 hover:text-brand rounded-xl font-semibold text-sm transition quick-action"><i aria-hidden="true" className="far fa-user" /> View</button>
          <button type="button" onClick={(e) => e.stopPropagation()} className="flex-[2] py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand/30 transition quick-action"><i aria-hidden="true" className="far fa-comment-dots" /> Message</button>
        </div>
      </div>
    </div>
  );
}

export function ResultListItem({ profile: p, index, onOpen }) {
  const open = () => onOpen(p);
  return (
    <div className="list-card glass rounded-2xl overflow-hidden card-shadow flex flex-col md:flex-row items-stretch cursor-pointer" {...linkProps(open)} style={{ animation: `slideUp 0.4s ease-out ${index * 0.05}s both` }}>
      <div className="relative md:w-48 flex-shrink-0 overflow-hidden"><img loading="lazy" decoding="async" alt="Profile photo" src={p.image || PLACEHOLDER} className="w-full h-48 md:h-full object-cover object-top" /></div>
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-heading font-bold mb-1"><span>{p.name || 'Unknown'}</span>, <span>{p.age || 'N/A'}</span><span className="ml-2 text-xs font-mono font-normal text-slate-400">{idOf(p)}</span></h3>
          <p className="text-sm text-slate-500 mb-2"><i aria-hidden="true" className="fas fa-map-marker-alt text-brand mr-1" /><span>{where(p)}</span></p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-leaf mr-1" />Pure Veg</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold"><i aria-hidden="true" className="fas fa-briefcase mr-1" /><span>{p.occupation || p.job || 'N/A'}</span></span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); open(); }} className="flex-1 md:flex-none px-6 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-brand/10 hover:text-brand rounded-xl font-semibold text-sm transition quick-action"><i aria-hidden="true" className="far fa-user mr-1" /> View Profile</button>
          <button type="button" onClick={(e) => e.stopPropagation()} className="flex-1 md:flex-none px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand/30 transition quick-action"><i aria-hidden="true" className="far fa-comment-dots mr-1" /> Message</button>
        </div>
      </div>
    </div>
  );
}

export function TrendingNow({ items, onOpen }) {
  return (
    <div className="mt-12 animate-fade-in">
      <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2"><i aria-hidden="true" className="fas fa-fire text-orange-500" /> Trending Now</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((t) => (
          <div key={t.name} className="glass rounded-2xl p-4 card-shadow text-center card-hover cursor-pointer" {...linkProps(() => onOpen(t))}>
            <img loading="lazy" decoding="async" alt="Profile photo" src={t.image} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-brand/30" />
            <div className="font-bold text-sm">{t.name}</div>
            <div className="text-xs text-slate-500">{t.info}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
