import FormInput from '../../../../components/ui/FormInput.jsx';
import RadioCardGroup from '../../../../components/ui/RadioCardGroup.jsx';
import { PROFILE_FOR } from '../options.js';

export default function Step1Basic({ form, set, update, isLoading, onSendOtp }) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-1">Let's get started</h2>
        <p className="text-slate-500 dark:text-slate-400">Tell us a little about yourself and how to contact you.</p>
      </div>

      <RadioCardGroup
        label="Profile created for *"
        name="profile_for"
        options={PROFILE_FOR}
        value={form.profileFor}
        onChange={set('profileFor')}
        gridClass="grid grid-cols-3 gap-3"
        spanClass="text-slate-700 dark:text-slate-200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput id="first-name" label="First Name *" type="text" value={form.firstName} onChange={update('firstName')} placeholder="e.g., Mahesh" required />
        <FormInput id="last-name" label="Last Name *" type="text" value={form.lastName} onChange={update('lastName')} placeholder="e.g., Kumar" required />
      </div>

      <div>
        <label htmlFor="phone-number" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number *</label>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all bg-white dark:bg-slate-900">
          <span className="inline-flex items-center px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium border-r border-slate-200 dark:border-slate-600">+91</span>
          <input
            id="phone-number"
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            className="flex-1 px-4 py-3 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
            placeholder="98765 43210"
            required
          />
        </div>
      </div>

      <FormInput id="email-address" label="Email Address *" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />

      <FormInput
        id="create-password"
        label="Create Password *"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={update('password')}
        placeholder="Min 8 characters"
        required
      />

      <button type="button" onClick={onSendOtp} className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
        <span>{isLoading ? 'Sending OTP...' : 'Send OTP & Next'}</span>
        {!isLoading && <i aria-hidden="true" className="fas fa-arrow-right" />}
        {isLoading && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
      </button>
    </>
  );
}
