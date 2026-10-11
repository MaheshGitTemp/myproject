import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import { idOf, profileUrl, searchProfiles } from '../../../services/profileLookupService.js';
import ActiveFilters from './components/ActiveFilters.jsx';
import FilterForm from './components/FilterForm.jsx';
import ProfileIdSearch from './components/ProfileIdSearch.jsx';
import { ResultGridCard, ResultListItem, TrendingNow } from './components/ResultCards.jsx';
import SearchInitialState from './components/SearchInitialState.jsx';
import SkeletonCard from './components/SkeletonCard.jsx';
import { DEFAULT_FILTERS, SEARCH_DRAWER_ITEMS, SORTS, TRENDING } from './searchData.js';
import sortResults from './sortResults.js';

const CHIP_ON = 'bg-brand text-white shadow-lg';
const CHIP_OFF = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';

// Count of filters that differ from their defaults (powers the mobile toggle badge).
function activeFilterCount(form) {
  let n = 0;
  if (form.ageFrom !== DEFAULT_FILTERS.ageFrom || form.ageTo !== DEFAULT_FILTERS.ageTo) n += 1;
  ['gender', 'maritalStatus', 'heightFrom', 'caste', 'rasi', 'nakshatra', 'education', 'occupation', 'country', 'state', 'city', 'annualIncome'].forEach((k) => {
    if (String(form[k] ?? '') !== String(DEFAULT_FILTERS[k] ?? '') && String(form[k] ?? '').trim()) n += 1;
  });
  return n;
}

export default function Search() {
  usePageMeta({
    title: 'Search Profiles | Telugu Sambandham',
    description: 'Search and filter profiles by age, location, education, profession and more.',
    robots: 'noindex, nofollow',
  });
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FILTERS);
  const [advanced, setAdvanced] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile FilterForm collapse state
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [demo, setDemo] = useState(false);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const openProfile = (p) => { const id = idOf(p); if (id) navigate(profileUrl(id)); };

  // Reactive sort: reorders a copy of the current results whenever either changes.
  const sortedResults = useMemo(() => sortResults(results, sortBy), [results, sortBy]);
  const activeCount = activeFilterCount(form);

  // Shared search routine. Takes an explicit form so chip-removal / clear-all can
  // re-run the same filtering path with an updated form (no reliance on async state).
  async function runSearch(nextForm) {
    setLoading(true); setHasSearched(true); setDemo(false);
    const res = await searchProfiles(nextForm);
    setResults(res.results); setTotal(res.total); setDemo(res.demo);
    setLoading(false);
  }
  function onSubmit(e) {
    e.preventDefault();
    runSearch(form);
  }
  function removeFilter(key) {
    const next = { ...form };
    if (key === 'age') { next.ageFrom = DEFAULT_FILTERS.ageFrom; next.ageTo = DEFAULT_FILTERS.ageTo; }
    else next[key] = DEFAULT_FILTERS[key];
    setForm(next);
    runSearch(next);
  }
  function clearAllFilters() {
    setForm(DEFAULT_FILTERS);
    runSearch(DEFAULT_FILTERS);
  }
  function reset() {
    setForm(DEFAULT_FILTERS); setResults([]); setTotal(0); setHasSearched(false); setDemo(false);
  }

  const hasResults = sortedResults.length > 0;
  const showInitial = !hasSearched && !loading;
  const showEmpty = hasSearched && !loading && !hasResults;

  return (
    <MainLayout variant="app" active="search" drawer={{ items: SEARCH_DRAWER_ITEMS }} mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft dark:bg-brand/10 text-brand text-xs font-semibold mb-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span>Advanced Search</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Find Your <span className="gradient-text">Perfect Match</span></h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">Use our smart filters to narrow down your search and find the ideal partner based on your preferences.</p>
      </div>

      <ProfileIdSearch />

      {/* Mobile-only toggle: the long filter form collapses behind this on small screens. */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        className="md:hidden w-full mb-6 px-6 py-3 rounded-2xl glass card-shadow flex items-center justify-between font-semibold text-sm active:scale-[0.98] transition"
        aria-expanded={filtersOpen}
      >
        <span className="flex items-center gap-2">
          <i aria-hidden="true" className="fas fa-sliders-h text-brand" /> Filters
          {activeCount > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand text-white">{activeCount}</span>}
        </span>
        <i aria-hidden="true" className={`fas ${filtersOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
      </button>

      <div className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
        <FilterForm form={form} setField={setField} advanced={advanced} onToggleAdvanced={() => setAdvanced((a) => !a)} onReset={reset} onSubmit={onSubmit} loading={loading} />
      </div>

      {demo && hasResults && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <i aria-hidden="true" className="fas fa-info-circle" /> Showing demo profiles because the search service could not be reached.
        </div>
      )}

      {hasSearched && (
        <ActiveFilters form={form} defaults={DEFAULT_FILTERS} onRemove={removeFilter} onClearAll={clearAllFilters} />
      )}

      {hasResults && (
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

      {/* Sort + view controls sit WITH the results so sorting visibly reorders what's below. */}
      {hasResults && (
        <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 flex-1 min-w-0">
            {SORTS.map((s) => (
              <button key={s.id} type="button" onClick={() => setSortBy(s.id)} className={`${sortBy === s.id ? CHIP_ON : CHIP_OFF} filter-chip px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 active:scale-[0.97]`}>
                <i aria-hidden="true" className={`fas ${s.icon}`} /> {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0">
            {[['grid', 'fa-th-large', 'Grid'], ['list', 'fa-list', 'List']].map(([mode, icon, label]) => (
              <button key={mode} type="button" onClick={() => setView(mode)} className={`${view === mode ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' : 'text-slate-500'} px-4 py-2 rounded-lg transition text-sm font-semibold active:scale-[0.97]`}>
                <i aria-hidden="true" className={`fas ${icon} mr-1`} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <SkeletonCard view={view} count={6} />}

      {!loading && hasResults && view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResults.map((p, i) => <ResultGridCard key={p.id || p.uid || i} profile={p} index={i} onOpen={openProfile} />)}
        </div>
      )}
      {!loading && hasResults && view === 'list' && (
        <div className="space-y-3">
          {sortedResults.map((p, i) => <ResultListItem key={p.id || p.uid || i} profile={p} index={i} onOpen={openProfile} />)}
        </div>
      )}

      {showEmpty && (
        <>
          <div className="text-center py-16 px-6 glass rounded-3xl max-w-lg mx-auto card-shadow animate-bounce-in">
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-brand-soft to-rose-100 dark:from-brand/20 dark:to-brand/10 rounded-full flex items-center justify-center mx-auto animate-float">
                <i aria-hidden="true" className="fas fa-search text-5xl text-brand" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <i aria-hidden="true" className="fas fa-sparkles text-white text-sm" />
              </div>
            </div>
            <h3 className="text-2xl font-heading font-bold mb-2">No matches found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Try adjusting your filters to discover more profiles.</p>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition hover:scale-105 active:scale-[0.97]">
              <i aria-hidden="true" className="fas fa-undo" /> Clear All Filters
            </button>
          </div>
          <TrendingNow items={TRENDING} onOpen={openProfile} />
        </>
      )}

      {showInitial && (
        <>
          <SearchInitialState />
          <TrendingNow items={TRENDING} onOpen={openProfile} />
        </>
      )}
    </MainLayout>
  );
}
