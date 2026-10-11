import { useState } from 'react';
import { Link } from 'react-router-dom';
import ToastStack from '../../../components/ui/ToastStack.jsx';
import useToastStack from '../../../hooks/useToastStack.js';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import MatchCard from './components/MatchCard.jsx';
import MatchListItem from './components/MatchListItem.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import { applyFilters, FILTERS, MATCHES_DRAWER_ITEMS, MUTUALS, SHORTLISTED } from './matchesData.js';

const EMPTY_TEXT = {
  shortlisted: 'Start swiping on the Home page to save profiles you like!',
  mutual: 'When someone you like also likes you back, they will appear here.',
};

export default function Matches() {
  usePageMeta({
    title: 'My Matches | Telugu Sambandham',
    description: 'Browse profiles recommended for you on Telugu Sambandham.',
    robots: 'noindex, nofollow',
  });
  const { toasts, showToast, removeToast } = useToastStack();
  const [tab, setTab] = useState('shortlisted');
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(['all']);
  const [shortlisted, setShortlisted] = useState(SHORTLISTED);
  const [mutuals, setMutuals] = useState(MUTUALS);
  const [selected, setSelected] = useState(null);

  const isMutual = tab === 'mutual';
  const all = isMutual ? mutuals : shortlisted;
  const visible = applyFilters(all, active, query);
  const countClass = (on) => `px-2 py-0.5 rounded-full text-xs font-bold ${on ? 'bg-brand text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`;

  function toggleFilter(id) {
    if (id === 'all') setActive(['all']);
    else setActive((cur) => {
      const rest = cur.filter((x) => x !== 'all');
      return rest.includes(id) ? rest.filter((x) => x !== id) : [...rest, id];
    });
  }
  function removeProfile(uid) {
    if (isMutual) setMutuals((l) => l.filter((p) => p.uid !== uid));
    else setShortlisted((l) => l.filter((p) => p.uid !== uid));
    showToast('Removed', 'Profile removed from your matches.');
  }
  const message = (p) => showToast('Message Sent', `Your interest has been sent to ${p.name}!`);
  const shortlist = (p) => showToast('Shortlisted', `${p.name} added to your shortlist!`);

  const cardProps = { mutual: isMutual, onOpen: setSelected, onRemove: removeProfile, onMessage: message };

  return (
    <MainLayout
      variant="app"
      active="matches"
      drawer={{ items: MATCHES_DRAWER_ITEMS, member: true, logout: true }}
      mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10"
      overlays={(
        <>
          <ProfileModal
            profile={selected}
            onClose={() => setSelected(null)}
            onRemove={(uid) => { removeProfile(uid); setSelected(null); }}
            onShortlist={(p) => { shortlist(p); setSelected(null); }}
            onMessage={(p) => { message(p); setSelected(null); }}
          />
          <ToastStack toasts={toasts} onClose={removeToast} />
        </>
      )}
    >
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft dark:bg-brand/10 text-brand text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>Your Matches</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Find Your <span className="gradient-text">Perfect Match</span></h1>
            <p className="text-slate-500 dark:text-slate-400">Review your shortlisted profiles and mutual connections.</p>
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl relative">
            <div className="tab-indicator absolute top-1 bottom-1 rounded-xl bg-white dark:bg-slate-700 shadow-md" style={{ width: 'calc(50% - 4px)', left: isMutual ? 'calc(50%)' : '4px' }} />
            <button type="button" onClick={() => setTab('shortlisted')} className={`relative z-10 flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${!isMutual ? 'text-brand' : 'text-slate-500 dark:text-slate-400'}`}>
              <i aria-hidden="true" className="far fa-bookmark" />
              <span>Shortlisted</span>
              <span className={countClass(!isMutual)}>{shortlisted.length}</span>
            </button>
            <button type="button" onClick={() => setTab('mutual')} className={`relative z-10 flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${isMutual ? 'text-brand' : 'text-slate-500 dark:text-slate-400'}`}>
              <i aria-hidden="true" className="fas fa-heart" />
              <span>Mutual Matches</span>
              <span className={countClass(isMutual)}>{mutuals.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 relative">
          <i aria-hidden="true" className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, location, or caste..." aria-label="Search matches" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition text-sm" />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[['grid', 'fa-th-large', 'Grid'], ['list', 'fa-list', 'List']].map(([mode, icon, label]) => (
            <button key={mode} type="button" onClick={() => setView(mode)} className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${view === mode ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' : 'text-slate-500'}`}>
              <i aria-hidden="true" className={`fas ${icon} mr-1`} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" onClick={() => toggleFilter(f.id)} className={`filter-chip px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 ${active.includes(f.id) ? 'bg-brand text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
            <i className={f.icon} />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <div className="view-transition">
        {visible.length === 0 && (
          <div className="text-center py-16 px-6 glass rounded-3xl max-w-lg mx-auto card-shadow animate-bounce-in">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-soft to-rose-100 dark:from-brand/20 dark:to-brand/10 rounded-full flex items-center justify-center mx-auto animate-float">
                <i aria-hidden="true" className="fas fa-heart-broken text-5xl text-brand" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <i aria-hidden="true" className="fas fa-sparkles text-white text-sm" />
              </div>
            </div>
            <h3 className="text-2xl font-heading font-bold mb-2">No matches yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{EMPTY_TEXT[tab]}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl shadow-lg shadow-brand/30 transition-all hover:scale-105">
              <i aria-hidden="true" className="fas fa-home" /> Go to Home
            </Link>
          </div>
        )}

        {visible.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((p, i) => <MatchCard key={p.uid} profile={p} index={i} {...cardProps} />)}
          </div>
        )}
        {visible.length > 0 && view === 'list' && (
          <div className="space-y-3">
            {visible.map((p, i) => <MatchListItem key={p.uid} profile={p} index={i} {...cardProps} />)}
          </div>
        )}

        {visible.length > 0 && (
          <div className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
            Showing <strong className="text-brand">{visible.length}</strong> of <strong>{all.length}</strong> profiles
          </div>
        )}
      </div>
    </MainLayout>
  );
}
