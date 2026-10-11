import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import { idOf, profileUrl, searchProfiles } from '../../../services/profileLookupService.js';
import FilterForm from './components/FilterForm.jsx';
import ProfileIdSearch from './components/ProfileIdSearch.jsx';
import { ResultGridCard, ResultListItem, TrendingNow } from './components/ResultCards.jsx';
import { DEFAULT_FILTERS, SEARCH_DRAWER_ITEMS, SORTS, TRENDING } from './searchData.js';

const CHIP_ON = 'bg-brand text-white';
const CHIP_OFF = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';

export default function Search() {
  usePageMeta({
    title: 'Search Profiles | Telugu Sambandham',
    description: 'Search and filter profiles by age, location, education, profession and more.',
    robots: 'noindex, nofollow',
  });
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FILTERS);
  const [advanced, setAdvanced] = useState(false);
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('recent'); // visual only, as in the original
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [demo, setDemo] = useState(false);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const openProfile = (p) => { const id = idOf(p); if (id) navigate(profileUrl(id)); };

  async function runSearch(e) {
    e.preventDefault();
    setLoading(true); setHasSearched(true); setDemo(false);
    const res = await searchProfiles(form);
    setResults(res.results); setTotal(res.total); setDemo(res.demo);
    setLoading(false);
  }
  function reset() {
    setForm(DEFAULT_FILTERS); setResults([]); setTotal(0); setHasSearched(false); setDemo(false);
  }

  return (
    <MainLayout variant="app" active="search" drawer={{ items: SEARCH_DRAWER_ITEMS }} mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Find Your <span className="gradient-text">Perfect Match</span></h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">Use our smart filters to narrow down your search and find the ideal partner based on your preferences.</p>
      </div>

      <ProfileIdSearch />

      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
        {SORTS.map((s) => (
          <button key={s.id} type="button" onClick={() => setSortBy(s.id)} className={`${sortBy === s.id ? CHIP_ON : CHIP_OFF} filter-chip px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2`}>
            <i aria-hidden="true" className={`fas ${s.icon}`} /> {s.label}
          </button>
        ))}
        <div className="ml-auto flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[['grid', 'fa-th-large', 'Grid'], ['list', 'fa-list', 'List']].map(([mode, icon, label]) => (
            <button key={mode} type="button" onClick={() => setView(mode)} className={`${view === mode ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' : 'text-slate-500'} px-4 py-2 rounded-lg transition text-sm font-semibold`}>
              <i aria-hidden="true" className={`fas ${icon} mr-1`} /> {label}
            </button>
          ))}
        </div>
      </div>

      <FilterForm form={form} setField={setField} advanced={advanced} onToggleAdvanced={() => setAdvanced((a) => !a)} onReset={reset} onSubmit={runSearch} loading={loading} />

      {demo && results.length > 0 && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <i aria-hidden="true" className="fas fa-info-circle" /> Showing demo profiles because the search service could not be reached.
        </div>
      )}

      {results.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-6 card-shadow flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand"><i aria-hidden="true" className="fas fa-search text-xl" /></div>
            <div>
              <div className="font-bold">Search Summary</div>
              <div className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-brand">{total}</span> Potential Matches • <span>{form.gender}</span> • <span>{form.ageFrom}</span>-<span>{form.ageTo}</span> yrs</div>
            </div>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && hasSearched && (
        <div className="text-center py-16 px-6 glass rounded-3xl max-w-lg mx-auto card-shadow animate-bounce-in">
          <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4"><i aria-hidden="true" className="fas fa-search text-4xl text-brand" /></div>
          <h3 className="text-2xl font-heading font-bold mb-2">No matches found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters to discover more profiles.</p>
          <button type="button" onClick={reset} className="px-6 py-3 bg-brand text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition hover:scale-105">Clear All Filters</button>
        </div>
      )}

      {view === 'grid' && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((p, i) => <ResultGridCard key={p.uid || i} profile={p} index={i} onOpen={openProfile} />)}
        </div>
      )}
      {view === 'list' && results.length > 0 && (
        <div className="space-y-3">
          {results.map((p, i) => <ResultListItem key={p.uid || i} profile={p} index={i} onOpen={openProfile} />)}
        </div>
      )}

      <TrendingNow items={TRENDING} onOpen={openProfile} />
    </MainLayout>
  );
}
