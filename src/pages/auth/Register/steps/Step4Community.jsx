import FormInput from '../../../../components/ui/FormInput.jsx';
import RadioCardGroup from '../../../../components/ui/RadioCardGroup.jsx';
import SelectField from '../../../../components/ui/SelectField.jsx';
import { NAKSHATRAS, PADAMS, RASIS, SUB_CASTES } from '../options.js';
import StepNav from './StepNav.jsx';

export default function Step4Community({ form, set, update, onBack, onNext }) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-1">Community &amp; Astrology</h2>
        <p className="text-slate-500 dark:text-slate-400">Help us find matches within the Viswabrahmin community.</p>
      </div>

      <SelectField
        id="caste-community"
        label="Caste / Community *"
        options={['Viswabrahmin']}
        defaultValue="Viswabrahmin"
        className="bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
        disabled
      >
        <p className="text-xs text-slate-500 mt-1">Telugu Sambandham is exclusively for the Viswabrahmin community.</p>
      </SelectField>

      <SelectField id="sub-caste" label="Sub-Caste *" options={SUB_CASTES} value={form.subCaste} onChange={update('subCaste')} required />

      <FormInput id="gothram" label="Gothram *" type="text" value={form.gothram} onChange={update('gothram')} placeholder="e.g. Vishwakarma" required />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField id="rasi-moon-sign" label="Rasi (Moon Sign)" options={RASIS} value={form.rasi} onChange={update('rasi')} />
        <SelectField id="nakshatra-star" label="Nakshatra (Star)" options={NAKSHATRAS} value={form.nakshatra} onChange={update('nakshatra')} />
      </div>

      <RadioCardGroup
        label="Padam"
        name="padam"
        options={PADAMS}
        value={form.padam}
        onChange={set('padam')}
        gridClass="grid grid-cols-4 gap-3"
      />

      <StepNav onBack={onBack} onNext={onNext} />
    </>
  );
}
