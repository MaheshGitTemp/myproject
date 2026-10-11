import Transition, { ALPINE_DEFAULT } from '../../../../components/ui/Transition.jsx';
import {
  AGE_FROM, AGE_TO, CASTES, COUNTRIES, EDUCATION, HEIGHTS, MARITAL, NAKSHATRAS, OCCUPATIONS, RASIS, STATES,
} from '../searchData.js';

const LABEL = 'block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2';
const SECTION = 'mb-8 border-t border-slate-200 dark:border-slate-700 pt-8';
const BTN = 'px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition flex items-center justify-center gap-2';

// <select class="form-input"> with an "Any ..." first option (value '').
function Select({ id, label, value, onChange, options, any, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <select id={id} value={value} onChange={onChange} className="form-input" {...rest}>
        {any !== undefined && <option value="">{any}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function FilterForm({ form, setField, advanced, onToggleAdvanced, onReset, onSubmit, loading }) {
  const bind = (key) => ({ value: form[key], onChange: (e) => setField(key, e.target.value) });
  return (
    <div className="glass rounded-3xl p-6 md:p-8 card-shadow mb-8 animate-slide-up">
      <form onSubmit={onSubmit}>
        <div className="mb-8">
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2"><i aria-hidden="true" className="fas fa-sliders-h text-brand" /> Basic Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className={`${LABEL} block`}>Looking For</span>
              <div className="flex gap-2">
                {[['Female', 'Bride'], ['Male', 'Groom']].map(([value, text]) => (
                  <label key={value} className="flex-1 cursor-pointer">
                    <input type="radio" name="gender" value={value} checked={form.gender === value} onChange={(e) => setField('gender', e.target.value)} className="peer sr-only" />
                    <div className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:bg-brand peer-checked:text-white peer-checked:border-brand transition text-sm font-medium">{text}</div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="age-range" className={LABEL}>Age Range</label>
              <div className="flex items-center gap-2">
                <select id="age-range" {...bind('ageFrom')} className="form-input">{AGE_FROM.map((a) => <option key={a} value={a}>{a}</option>)}</select>
                <span className="text-slate-400">to</span>
                <select aria-label="Maximum age" {...bind('ageTo')} className="form-input">{AGE_TO.map((a) => <option key={a} value={a}>{a}</option>)}</select>
              </div>
            </div>
            <Select id="height" label="Height" any="Any Height" options={HEIGHTS} {...bind('heightFrom')} />
            <Select id="marital-status" label="Marital Status" any="Any" options={MARITAL} {...bind('maritalStatus')} />
          </div>
        </div>

        <Transition show={advanced} {...ALPINE_DEFAULT} className={SECTION}>
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2"><i aria-hidden="true" className="fas fa-star text-brand" /> Community &amp; Astrology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select id="caste-community" label="Caste / Community" any="Any Caste" options={CASTES} {...bind('caste')} />
            <Select id="rasi-optional" label="Rasi (Optional)" any="Any Rasi" options={RASIS} {...bind('rasi')} />
            <Select id="nakshatra-optional" label="Nakshatra (Optional)" any="Any Nakshatra" options={NAKSHATRAS} {...bind('nakshatra')} />
          </div>
        </Transition>

        <Transition show={advanced} {...ALPINE_DEFAULT} className={SECTION}>
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2"><i aria-hidden="true" className="fas fa-briefcase text-brand" /> Professional &amp; Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select id="education" label="Education" any="Any Education" options={EDUCATION} {...bind('education')} />
            <Select id="occupation" label="Occupation" any="Any Occupation" options={OCCUPATIONS} {...bind('occupation')} />
            <Select id="country" label="Country" options={COUNTRIES} {...bind('country')} />
            <Select id="state" label="State" any="Any State" options={STATES} {...bind('state')} />
          </div>
        </Transition>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onToggleAdvanced} className={BTN}>
            <i aria-hidden="true" className={`fas ${advanced ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
            <span>{advanced ? 'Hide Advanced' : 'Show Advanced'}</span>
          </button>
          <button type="button" onClick={onReset} className={BTN}><i aria-hidden="true" className="fas fa-undo" /> Clear All Filters</button>
          <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition flex items-center justify-center gap-2 disabled:opacity-70">
            {!loading && <i aria-hidden="true" className="fas fa-search" />}
            {loading && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
            <span>{loading ? 'Searching...' : 'Search Now'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
