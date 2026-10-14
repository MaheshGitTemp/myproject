import FormInput from '../../../../components/ui/FormInput.jsx';
import RadioCardGroup from '../../../../components/ui/RadioCardGroup.jsx';
import SelectField from '../../../../components/ui/SelectField.jsx';
import {
  GENDER, PROFILE_EDUCATION, PROFILE_HEIGHTS,
  PROFILE_MARITAL_STATUS, PROFILE_OCCUPATION, SALARY, STATES,
} from '../options.js';
import StepNav from './StepNav.jsx';

export default function Step3ProfileDetails({ form, set, update, onBack, onNext }) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-1">Profile Details</h2>
        <p className="text-slate-500 dark:text-slate-400">Tell us about yourself.</p>
      </div>

      <RadioCardGroup
        label="Gender *"
        name="gender"
        options={GENDER}
        value={form.gender}
        onChange={set('gender')}
        gridClass="grid grid-cols-2 gap-3"
        spanClass="text-slate-700 dark:text-slate-200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput id="dob" label="Date of Birth *" type="date" value={form.dob} onChange={update('dob')} required />
        <SelectField id="profile-height" label="Height *" options={PROFILE_HEIGHTS} value={form.profileHeight} onChange={update('profileHeight')} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField id="profile-marital-status" label="Marital Status *" options={PROFILE_MARITAL_STATUS} value={form.profileMaritalStatus} onChange={update('profileMaritalStatus')} required />
        <SelectField id="profile-education" label="Education *" options={PROFILE_EDUCATION} value={form.profileEducation} onChange={update('profileEducation')} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField id="profile-occupation" label="Occupation *" options={PROFILE_OCCUPATION} value={form.profileOccupation} onChange={update('profileOccupation')} required />
        <SelectField id="profile-salary" label="Annual Income *" options={SALARY} value={form.salary} onChange={update('salary')} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput id="city" label="City *" type="text" value={form.city} onChange={update('city')} placeholder="e.g. Hyderabad" required />
        <SelectField id="state" label="State *" options={STATES} value={form.state} onChange={update('state')} required />
      </div>

      <div>
        <label htmlFor="about-me" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">About Me</label>
        <textarea
          id="about-me"
          className="form-input"
          rows={4}
          value={form.aboutMe}
          onChange={update('aboutMe')}
          placeholder="Write a few lines about yourself..."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </>
  );
}
