// Dropdown / radio options for the Register wizard (copied 1:1 from register.html).
export const PROFILE_FOR = [
  { value: 'self', label: 'Self' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
];

export const SUB_CASTES = [
  { value: '', label: 'Select Sub-Caste' },
  'Goldsmith (Achari)', 'Carpenter (Vadrang)', 'Blacksmith (Kammari)',
  'Kamsyalkar (Kammari)', 'Silpi (Kamsyalkar)', 'Others',
];

export const RASIS = [
  { value: '', label: 'Select Rasi' },
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karkataka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)',
  'Dhanusu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

export const NAKSHATRAS = [
  { value: '', label: 'Select Nakshatra' },
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
];

export const PADAMS = ['1', '2', '3', '4'].map((n) => ({ value: n, label: n }));

export const LOOKING_FOR = [
  { value: 'bride', label: 'Bride' },
  { value: 'groom', label: 'Groom' },
];

export const AGE_FROM = ['18', '19', '20', '21', '22', '23', '24', '25'];
export const AGE_TO = ['25', '28', '30', '32', '35', '40'];

export const HEIGHTS = [
  'Any Height', `5'0" (152 cm)`, `5'2" (157 cm)`, `5'4" (162 cm)`, `5'6" (167 cm)`,
  `5'8" (172 cm)`, `5'10" (177 cm)`, `6'0" (182 cm)`,
];

export const MARITAL_STATUS = ['Any', 'Never Married', 'Widowed', 'Divorced'];

export const EDUCATION = ['Any Education', 'Bachelors', 'Masters', 'PhD', 'BTech', 'MBBS', 'MBA', 'CA', 'Diploma'];

export const OCCUPATION = [
  'Any Occupation', 'Software Engineer', 'Doctor', 'Teacher', 'Business Owner',
  'Government Employee', 'Architect', 'Designer',
];

// Own-attribute options for the new Profile Details step (step 3). These lead with a neutral
// "Select …" placeholder and contain concrete values only — distinct from the preference lists above.
export const GENDER = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const PROFILE_HEIGHTS = [
  { value: '', label: 'Select Height' },
  `4'10" (147 cm)`, `5'0" (152 cm)`, `5'2" (157 cm)`, `5'4" (162 cm)`,
  `5'6" (167 cm)`, `5'8" (172 cm)`, `5'10" (177 cm)`, `6'0" (182 cm)`, `6'2" (187 cm)`,
];

export const PROFILE_MARITAL_STATUS = [
  { value: '', label: 'Select Status' },
  'Never Married', 'Widowed', 'Divorced',
];

export const PROFILE_EDUCATION = [
  { value: '', label: 'Select Education' },
  'Bachelors', 'Masters', 'PhD', 'BTech', 'MBBS', 'MBA', 'CA', 'Diploma', 'Other',
];

export const PROFILE_OCCUPATION = [
  { value: '', label: 'Select Occupation' },
  'Software Engineer', 'Doctor', 'Teacher', 'Business Owner',
  'Government Employee', 'Architect', 'Designer', 'Other',
];

export const STATES = [
  { value: '', label: 'Select State' },
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala',
  'Maharashtra', 'Delhi', 'Gujarat', 'West Bengal', 'Others',
];

export const SALARY = [
  { value: '', label: 'Select Annual Income' },
  'Below 3 Lakhs', '3 - 5 Lakhs', '5 - 8 Lakhs', '8 - 12 Lakhs',
  '12 - 18 Lakhs', '18 - 25 Lakhs', '25 - 35 Lakhs', '35 - 50 Lakhs', 'Above 50 Lakhs',
];

export const STEP_LABELS = ['Basic', 'Verify', 'Details', 'Community', 'Preferences', 'Photos'];
