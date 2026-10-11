import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../../../components/ui/FormInput.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { PILLS } from '../../../components/layout/AccountSidebar.jsx';
import {
  EDUCATION, GENDERS, HEIGHTS, INITIAL_PROFILE, MARITAL, NAKSHATRA, OCCUPATION, PADAM, RASI,
} from './editProfileData.js';

const LABEL = 'block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2';

function Card({ icon, title, columns, children }) {
  return (
    <div className="glass rounded-2xl p-6 card-shadow">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <i aria-hidden="true" className={`fas ${icon} text-brand`} /> {title}
      </h3>
      <div className={`grid grid-cols-1 ${columns} gap-4`}>{children}</div>
    </div>
  );
}

export default function EditProfile() {
  usePageMeta({
    title: 'Edit Profile | Telugu Sambandham',
    description: 'Update your personal, family, education and partner preference details.',
    robots: 'noindex, nofollow',
  });
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(() => ({
    ...INITIAL_PROFILE,
    firstName: user?.firstName || INITIAL_PROFILE.firstName,
    lastName: user?.lastName || INITIAL_PROFILE.lastName,
  }));
  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: call the API here
    showToast('Profile Updated', 'Your personal details have been saved successfully.', 'success', { duration: 3000 });
  }

  return (
    <AccountLayout
      subtitle="Edit Profile"
      title={<>Edit <span className="gradient-text">Profile</span></>}
      description={<>Keep your profile up-to-date to get better matches. Fields marked with <span className="text-brand font-bold">*</span> are required.</>}
      sidebarActive="edit-profile"
      pills={PILLS.profile}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card icon="fa-user" title="Personal Information" columns="md:grid-cols-2">
          <FormInput id="first-name" label="First Name *" labelClassName={LABEL} type="text" required {...bind('firstName')} />
          <FormInput id="last-name" label="Last Name *" labelClassName={LABEL} type="text" required {...bind('lastName')} />
          <SelectField id="gender" label="Gender *" labelClassName={LABEL} options={GENDERS} required {...bind('gender')} />
          <FormInput id="date-of-birth" label="Date of Birth *" labelClassName={LABEL} type="date" required {...bind('dob')} />
          <SelectField id="height" label="Height *" labelClassName={LABEL} options={HEIGHTS} required {...bind('height')} />
          <SelectField id="marital-status" label="Marital Status *" labelClassName={LABEL} options={MARITAL} required {...bind('maritalStatus')} />
          <div className="md:col-span-2">
            <label htmlFor="about-me" className={LABEL}>About Me</label>
            <textarea id="about-me" rows={4} className="form-input" placeholder="Tell us about yourself..." {...bind('about')} />
          </div>
        </Card>

        <Card icon="fa-star" title="Astrology Details" columns="md:grid-cols-3">
          <SelectField id="rasi" label="Rasi" labelClassName={LABEL} options={RASI} {...bind('rasi')} />
          <SelectField id="nakshatra" label="Nakshatra" labelClassName={LABEL} options={NAKSHATRA} {...bind('nakshatra')} />
          <SelectField id="padam" label="Padam" labelClassName={LABEL} options={PADAM} {...bind('padam')} />
        </Card>

        <Card icon="fa-briefcase" title="Professional Details" columns="md:grid-cols-2">
          <SelectField id="highest-education" label="Highest Education *" labelClassName={LABEL} options={EDUCATION} required {...bind('education')} />
          <SelectField id="occupation" label="Occupation *" labelClassName={LABEL} options={OCCUPATION} required {...bind('occupation')} />
          <FormInput id="annual-income" label="Annual Income" labelClassName={LABEL} type="text" placeholder="e.g., 12 Lakhs" {...bind('income')} />
          <FormInput id="job-location" label="Job Location *" labelClassName={LABEL} type="text" required placeholder="City" {...bind('location')} />
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/me" className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition text-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">Cancel</Link>
          <button type="submit" className="flex-1 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition transform hover:scale-[1.02] flex items-center justify-center gap-2">
            <i aria-hidden="true" className="fas fa-save" /> Save Changes
          </button>
        </div>
      </form>
    </AccountLayout>
  );
}
