import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../../../components/ui/FormInput.jsx';
import SelectField from '../../../components/ui/SelectField.jsx';
import SettingRow from '../../../components/ui/SettingRow.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getMyProfile, updateMyProfile } from '../../../services/accountService.js';
import { deletePhoto, listMyPhotos, photoFileUrl, uploadPhoto } from '../../../services/photosService.js';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { PILLS } from '../../../components/layout/AccountSidebar.jsx';
import {
  BODY_TYPES, DIET, DRINKING, EDUCATION, EMPLOYED_IN, FAMILY_STATUS, FAMILY_TYPE, FAMILY_VALUES,
  GENDERS, HEIGHTS, INITIAL_PROFILE, LOOKING_FOR, MANGLIK, MARITAL, MOTHER_TONGUES, NAKSHATRA,
  OCCUPATION, PADAM, PHYSICAL_STATUS, PREF_AGE, PREF_DIET, PREF_EDUCATION, PREF_HEIGHTS,
  PREF_MARITAL, PREF_OCCUPATION, RASI, RESIDENCY, SALARY, SMOKING, STATES, SUB_CASTES,
} from './editProfileData.js';

const LABEL = 'block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2';

// Collapsible section card. All sections start collapsed; clicking the header
// toggles. `open` and `onToggle` are controlled by the parent so one piece of
// state governs every section.
function Card({ icon, title, columns, open, onToggle, children }) {
  const bodyId = `section-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  return (
    <div className="glass rounded-2xl card-shadow overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="w-full flex items-center justify-between gap-2 p-6 text-left text-lg font-bold transition active:scale-[0.995]"
        >
          <span className="flex items-center gap-2">
            <i aria-hidden="true" className={`fas ${icon} text-brand`} /> {title}
          </span>
          <i
            aria-hidden="true"
            className={`fas fa-chevron-down text-sm text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      {open && (
        <div id={bodyId} className={`grid grid-cols-1 ${columns} gap-4 px-6 pb-6`}>
          {children}
        </div>
      )}
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
  const photoInputRef = useRef(null);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [form, setForm] = useState(() => ({
    ...INITIAL_PROFILE,
    firstName: user?.firstName || INITIAL_PROFILE.firstName,
    lastName: user?.lastName || INITIAL_PROFILE.lastName,
  }));
  const [photos, setPhotos] = useState([]);

  async function refetchPhotos() {
    const res = await listMyPhotos();
    setPhotos(res.photos || []);
  }

  // Load the member's own profile + preferences on mount and map them onto the
  // form. The backend getMyProfile() already returns EditProfile-shaped keys
  // (rowToDetail profile fields + prefsToForm pref* fields — the inverse of
  // authService.registerProfile's wizard->backend mapping), so we merge any
  // defined value over the INITIAL_PROFILE defaults and never clobber a field
  // the API left null/undefined.
  useEffect(() => {
    let active = true;
    (async () => {
      let data = null;
      try {
        data = await getMyProfile();
      } catch {
        data = null; // network error -> keep defaults
      }
      if (!active || !data) return;
      const { profile, preferences } = data;
      setForm((f) => {
        const next = { ...f };
        const apply = (obj) => {
          if (!obj) return;
          Object.entries(obj).forEach(([key, val]) => {
            if (key in INITIAL_PROFILE && val !== undefined && val !== null && val !== '') {
              next[key] = val;
            }
          });
        };
        // profile fields pass straight through (headline, about, firstName,
        // lastName, gender, dob, height, weight, maritalStatus, bodyType,
        // motherTongue, physicalStatus, phone, email, city, state, residency,
        // subCaste, gothram, rasi, nakshatra, padam, manglik, education,
        // fieldOfStudy, college, occupation, employedIn, company, income,
        // workLocation, fatherOccupation, motherOccupation, siblings,
        // familyType, familyValues, familyStatus, diet, smoking, drinking,
        // hobbies). dob from rowToDetail is YYYY-MM-DD for the date input.
        apply(profile);
        // preferences: lookingFor, prefLocation, prefAgeFrom/prefAgeTo,
        // prefHeightFrom/prefHeightTo, prefMaritalStatus, prefEducation,
        // prefOccupation, prefDiet (already pref* keys from prefsToForm).
        apply(preferences);
        return next;
      });
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    refetchPhotos();
  }, []);

  async function handlePhotoFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const res = await uploadPhoto(file);
      if (!res.ok) {
        showToast('Upload Failed', 'One of your photos could not be uploaded.', 'error', { duration: 4000, icon: 'fa-times-circle' });
      }
    }
    await refetchPhotos();
  }

  async function removePhoto(id) {
    const res = await deletePhoto(id);
    if (res.ok) await refetchPhotos();
    else showToast('Delete Failed', 'Could not remove the photo. Please try again.', 'error', { duration: 4000, icon: 'fa-times-circle' });
  }
  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });
  const toggle = (key) => ({
    checked: form[key],
    onChange: (v) => setForm((f) => ({ ...f, [key]: v })),
  });

  // Accordion: every section starts collapsed; sections toggle independently, so
  // multiple can be open at once (opening one does not close the others).
  const [openSections, setOpenSections] = useState(() => new Set());
  const section = (title) => ({
    open: openSections.has(title),
    onToggle: () => setOpenSections((cur) => {
      const next = new Set(cur);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    }),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    // The form keys already match the EditProfile payload PUT /profiles/me
    // (buildProfileFields/buildPreferenceFields) accepts, so send as-is.
    const res = await updateMyProfile(form);
    if (res.ok) {
      showToast('Profile Updated', 'Your personal details have been saved successfully.', 'success', { duration: 3000 });
    } else {
      showToast('Update Failed', 'Could not save your profile. Please try again.', 'error', { duration: 4000, icon: 'fa-times-circle' });
    }
  }

  return (
    <AccountLayout
      subtitle="Edit Profile"
      title={<>Edit <span className="gradient-text">Profile</span></>}
      description={<>Keep your profile up-to-date to get better matches. Fields marked with <span className="text-brand font-bold">*</span> are required.</>}
      sidebarActive="edit-profile"
      pills={PILLS.profile}
    >
      {/* noValidate: required fields can live inside collapsed accordion sections,
          which the browser cannot focus for native validation. Validation is handled
          on submit (stubbed here) rather than by the browser blocking on hidden fields. */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* 1. About Me */}
        <Card icon="fa-user-pen" title="About Me" columns="md:grid-cols-1" {...section('About Me')}>
          <FormInput id="headline" label="Profile Headline" labelClassName={LABEL} type="text" placeholder="A short tagline that describes you" {...bind('headline')} />
          <div>
            <label htmlFor="about-me" className={LABEL}>About Me</label>
            <textarea id="about-me" rows={4} className="form-input" placeholder="Tell us about yourself, your values and what you're looking for..." {...bind('about')} />
          </div>
        </Card>

        {/* 2. Personal Details */}
        <Card icon="fa-user" title="Personal Details" columns="md:grid-cols-2" {...section('Personal Details')}>
          <FormInput id="first-name" label="First Name *" labelClassName={LABEL} type="text" required {...bind('firstName')} />
          <FormInput id="last-name" label="Last Name *" labelClassName={LABEL} type="text" required {...bind('lastName')} />
          <SelectField id="gender" label="Gender *" labelClassName={LABEL} options={GENDERS} required {...bind('gender')} />
          <FormInput id="date-of-birth" label="Date of Birth *" labelClassName={LABEL} type="date" required {...bind('dob')} />
          <SelectField id="height" label="Height *" labelClassName={LABEL} options={HEIGHTS} required {...bind('height')} />
          <FormInput id="weight" label="Weight" labelClassName={LABEL} type="text" placeholder="e.g., 65 kg" {...bind('weight')} />
          <SelectField id="marital-status" label="Marital Status *" labelClassName={LABEL} options={MARITAL} required {...bind('maritalStatus')} />
          <SelectField id="body-type" label="Body Type" labelClassName={LABEL} options={BODY_TYPES} {...bind('bodyType')} />
          <SelectField id="mother-tongue" label="Mother Tongue" labelClassName={LABEL} options={MOTHER_TONGUES} {...bind('motherTongue')} />
          <SelectField id="physical-status" label="Physical Status" labelClassName={LABEL} options={PHYSICAL_STATUS} {...bind('physicalStatus')} />
        </Card>

        {/* 3. Contact & Location */}
        <Card icon="fa-location-dot" title="Contact & Location" columns="md:grid-cols-2" {...section('Contact & Location')}>
          <FormInput id="phone" label="Phone *" labelClassName={LABEL} type="tel" required placeholder="+91 98765 43210" {...bind('phone')} />
          <FormInput id="email" label="Email *" labelClassName={LABEL} type="email" required placeholder="you@example.com" {...bind('email')} />
          <FormInput id="city" label="City *" labelClassName={LABEL} type="text" required placeholder="City" {...bind('city')} />
          <SelectField id="state" label="State *" labelClassName={LABEL} options={STATES} required {...bind('state')} />
          <SelectField id="residency" label="Residency Status" labelClassName={LABEL} options={RESIDENCY} {...bind('residency')} />
        </Card>

        {/* 4. Community & Astrology */}
        <Card icon="fa-om" title="Community & Astrology" columns="md:grid-cols-3" {...section('Community & Astrology')}>
          <SelectField
            id="caste"
            label="Caste / Community"
            labelClassName={LABEL}
            options={['Viswabrahmin']}
            value="Viswabrahmin"
            onChange={() => {}}
            disabled
            className="bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
          />
          <SelectField id="sub-caste" label="Sub-Caste *" labelClassName={LABEL} options={SUB_CASTES} required {...bind('subCaste')} />
          <FormInput id="gothram" label="Gothram" labelClassName={LABEL} type="text" placeholder="e.g. Vishwakarma" {...bind('gothram')} />
          <SelectField id="rasi" label="Rasi" labelClassName={LABEL} options={RASI} {...bind('rasi')} />
          <SelectField id="nakshatra" label="Nakshatra" labelClassName={LABEL} options={NAKSHATRA} {...bind('nakshatra')} />
          <SelectField id="padam" label="Padam" labelClassName={LABEL} options={PADAM} {...bind('padam')} />
          <SelectField id="manglik" label="Manglik" labelClassName={LABEL} options={MANGLIK} {...bind('manglik')} />
        </Card>

        {/* 5. Education */}
        <Card icon="fa-graduation-cap" title="Education" columns="md:grid-cols-3" {...section('Education')}>
          <SelectField id="highest-education" label="Highest Education *" labelClassName={LABEL} options={EDUCATION} required {...bind('education')} />
          <FormInput id="field-of-study" label="Field of Study / Specialization" labelClassName={LABEL} type="text" placeholder="e.g. Computer Science" {...bind('fieldOfStudy')} />
          <FormInput id="college" label="College / University" labelClassName={LABEL} type="text" placeholder="e.g. Osmania University" {...bind('college')} />
        </Card>

        {/* 6. Career Information */}
        <Card icon="fa-briefcase" title="Career Information" columns="md:grid-cols-2" {...section('Career Information')}>
          <SelectField id="occupation" label="Occupation *" labelClassName={LABEL} options={OCCUPATION} required {...bind('occupation')} />
          <SelectField id="employed-in" label="Employed In" labelClassName={LABEL} options={EMPLOYED_IN} {...bind('employedIn')} />
          <FormInput id="company" label="Company / Organization" labelClassName={LABEL} type="text" placeholder="e.g. Infosys" {...bind('company')} />
          <SelectField id="annual-income" label="Annual Income" labelClassName={LABEL} options={SALARY} {...bind('income')} />
          <FormInput id="work-location" label="Work Location" labelClassName={LABEL} type="text" placeholder="City" {...bind('workLocation')} />
        </Card>

        {/* 7. Family Details */}
        <Card icon="fa-people-roof" title="Family Details" columns="md:grid-cols-2" {...section('Family Details')}>
          <FormInput id="father-occupation" label="Father's Occupation" labelClassName={LABEL} type="text" placeholder="e.g. Business" {...bind('fatherOccupation')} />
          <FormInput id="mother-occupation" label="Mother's Occupation" labelClassName={LABEL} type="text" placeholder="e.g. Homemaker" {...bind('motherOccupation')} />
          <FormInput id="siblings" label="Number of Siblings" labelClassName={LABEL} type="text" placeholder="e.g. 1 Brother (Married)" {...bind('siblings')} />
          <SelectField id="family-type" label="Family Type" labelClassName={LABEL} options={FAMILY_TYPE} {...bind('familyType')} />
          <SelectField id="family-values" label="Family Values" labelClassName={LABEL} options={FAMILY_VALUES} {...bind('familyValues')} />
          <SelectField id="family-status" label="Family Status" labelClassName={LABEL} options={FAMILY_STATUS} {...bind('familyStatus')} />
        </Card>

        {/* 8. Lifestyle & Interests */}
        <Card icon="fa-leaf" title="Lifestyle & Interests" columns="md:grid-cols-3" {...section('Lifestyle & Interests')}>
          <SelectField id="diet" label="Diet" labelClassName={LABEL} options={DIET} {...bind('diet')} />
          <SelectField id="smoking" label="Smoking" labelClassName={LABEL} options={SMOKING} {...bind('smoking')} />
          <SelectField id="drinking" label="Drinking" labelClassName={LABEL} options={DRINKING} {...bind('drinking')} />
          <div className="md:col-span-3">
            <label htmlFor="hobbies" className={LABEL}>Hobbies & Interests</label>
            <textarea id="hobbies" rows={3} className="form-input" placeholder="e.g. Reading, travelling, classical music, cooking..." {...bind('hobbies')} />
          </div>
        </Card>

        {/* 9. Partner Preferences */}
        <Card icon="fa-heart-circle-check" title="Partner Preferences" columns="md:grid-cols-2" {...section('Partner Preferences')}>
          <SelectField id="looking-for" label="Looking For" labelClassName={LABEL} options={LOOKING_FOR} {...bind('lookingFor')} />
          <SelectField id="pref-location" label="Preferred Location" labelClassName={LABEL} options={STATES} {...bind('prefLocation')} />
          <div>
            <span className={LABEL}>Preferred Age Range</span>
            <div className="grid grid-cols-2 gap-3">
              <SelectField id="pref-age-from" label="" options={PREF_AGE} aria-label="Preferred age from" {...bind('prefAgeFrom')} />
              <SelectField id="pref-age-to" label="" options={PREF_AGE} aria-label="Preferred age to" {...bind('prefAgeTo')} />
            </div>
          </div>
          <div>
            <span className={LABEL}>Preferred Height Range</span>
            <div className="grid grid-cols-2 gap-3">
              <SelectField id="pref-height-from" label="" options={PREF_HEIGHTS} aria-label="Preferred height from" {...bind('prefHeightFrom')} />
              <SelectField id="pref-height-to" label="" options={PREF_HEIGHTS} aria-label="Preferred height to" {...bind('prefHeightTo')} />
            </div>
          </div>
          <SelectField id="pref-marital-status" label="Marital Status Preference" labelClassName={LABEL} options={PREF_MARITAL} {...bind('prefMaritalStatus')} />
          <SelectField id="pref-education" label="Education Preference" labelClassName={LABEL} options={PREF_EDUCATION} {...bind('prefEducation')} />
          <SelectField id="pref-occupation" label="Occupation Preference" labelClassName={LABEL} options={PREF_OCCUPATION} {...bind('prefOccupation')} />
          <SelectField id="pref-diet" label="Diet Preference" labelClassName={LABEL} options={PREF_DIET} {...bind('prefDiet')} />
        </Card>

        {/* 10. Photos & Verification */}
        <Card icon="fa-camera" title="Photos & Verification" columns="md:grid-cols-1" {...section('Photos & Verification')}>
          <div>
            <span className={LABEL}>Manage Photos</span>
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
              onClick={() => photoInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && photoInputRef.current?.click()}
              aria-label="Upload photos"
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="sr-only"
                onChange={(e) => {
                  handlePhotoFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <i aria-hidden="true" className="fas fa-images text-4xl text-slate-400 mb-3 group-hover:text-brand transition-colors" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {isTouchDevice ? 'Tap to select photos' : 'Drag & Drop photos here'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {isTouchDevice ? 'from your camera or photo library' : 'or click to browse from your device'}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}
                className="px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold transition shadow-md"
              >
                Upload Photo
              </button>
              <p className="text-xs text-slate-400 mt-3">Supports JPG, PNG. Max 5MB per file.</p>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img loading="lazy" decoding="async" src={photoFileUrl(photo.id, 'thumb')} alt="Profile" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                      aria-label="Delete photo"
                    >
                      <i aria-hidden="true" className="fas fa-trash-alt text-[11px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className={LABEL}>Verification Status</span>
            <div className="space-y-3">
              {[
                { key: 'email', title: 'Email Verified', verified: true, icon: 'fa-envelope' },
                { key: 'phone', title: 'Phone Verified', verified: true, icon: 'fa-phone' },
                { key: 'id', title: 'ID Verification', verified: false, icon: 'fa-id-card' },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <i aria-hidden="true" className={`fas ${row.icon} text-slate-400`} />
                    <span className="font-semibold text-sm text-slate-800 dark:text-white">{row.title}</span>
                  </div>
                  {row.verified ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                      <i aria-hidden="true" className="fas fa-circle-check" /> Verified
                    </span>
                  ) : (
                    <button type="button" className="px-4 py-2 text-xs font-semibold bg-brand hover:bg-brand-dark text-white rounded-lg transition">
                      Verify
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 11. Privacy & Settings */}
        <Card icon="fa-shield-halved" title="Privacy & Settings" columns="md:grid-cols-1" {...section('Privacy & Settings')}>
          <div className="space-y-5">
            <SettingRow title="Profile Visibility" description="Show my profile to premium members only." {...toggle('profileVisibilityPremium')} />
            <hr className="border-slate-200 dark:border-slate-700" />
            <SettingRow title="Photo Visibility" description="Show photos to accepted connections only." {...toggle('photoVisibilityConnections')} />
            <hr className="border-slate-200 dark:border-slate-700" />
            <SettingRow title="Contact Details Visibility" description="Share contact details with accepted connections only." {...toggle('contactVisibilityConnections')} />
            <hr className="border-slate-200 dark:border-slate-700" />
            <SettingRow title="Show Online Status" description="Let others see when you are online." {...toggle('showOnlineStatus')} />
          </div>
          <Link to="/profile-security" className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-brand hover:text-brand-dark transition">
            <i aria-hidden="true" className="fas fa-sliders" /> Advanced Privacy &amp; Security settings
          </Link>
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
