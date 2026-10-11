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

export const STEP_LABELS = ['Basic', 'Verify', 'Community', 'Preferences', 'Photos'];
