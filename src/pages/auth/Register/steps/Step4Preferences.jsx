import RadioCardGroup from '../../../../components/ui/RadioCardGroup.jsx';
import SelectField from '../../../../components/ui/SelectField.jsx';
import { AGE_FROM, AGE_TO, EDUCATION, HEIGHTS, LOOKING_FOR, MARITAL_STATUS, OCCUPATION } from '../options.js';
import StepNav from './StepNav.jsx';

const opt = (v) => <option key={v} value={v}>{v}</option>;

export default function Step4Preferences({ form, set, update, onBack, onNext }) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-1">Partner Preferences</h2>
        <p className="text-slate-500 dark:text-slate-400">What are you looking for in a life partner?</p>
      </div>

      <RadioCardGroup
        label="Looking For *"
        name="looking_for"
        options={LOOKING_FOR}
        value={form.lookingFor}
        onChange={set('lookingFor')}
        gridClass="grid grid-cols-2 gap-3"
        spanClass="text-slate-700 dark:text-slate-200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age-range" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Age Range</label>
          <div className="flex items-center gap-2">
            <select id="age-range" className="form-input text-center" value={form.ageFrom} onChange={update('ageFrom')}>
              {AGE_FROM.map(opt)}
            </select>
            <span className="text-slate-400 font-bold">to</span>
            <select className="form-input text-center" aria-label="Maximum age" value={form.ageTo} onChange={update('ageTo')}>
              {AGE_TO.map(opt)}
            </select>
          </div>
        </div>
        <SelectField id="height" label="Height" options={HEIGHTS} value={form.height} onChange={update('height')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField id="marital-status" label="Marital Status" options={MARITAL_STATUS} value={form.maritalStatus} onChange={update('maritalStatus')} />
        <SelectField id="education" label="Education" options={EDUCATION} value={form.education} onChange={update('education')} />
      </div>

      <SelectField id="occupation" label="Occupation" options={OCCUPATION} value={form.occupation} onChange={update('occupation')} />

      <StepNav onBack={onBack} onNext={onNext} />
    </>
  );
}
