// Option lists + default form values for the Edit Profile page.
// Values are kept coherent with the Register wizard (options.js), mockProfiles.js and
// ProfileDetails tabs so the data model stays consistent across the app.
// Select lists that need a blank default lead with { value: '', label: 'Select …' };
// Partner-preference lists lead with 'Any'.

const SELECT = (label) => ({ value: '', label });

// --- Personal ---------------------------------------------------------------
export const GENDERS = ['Male', 'Female'];

export const HEIGHTS = [
  SELECT('Select Height'),
  `4'8" (142 cm)`, `4'10" (147 cm)`, `5'0" (152 cm)`, `5'2" (157 cm)`, `5'4" (162 cm)`,
  `5'6" (167 cm)`, `5'8" (172 cm)`, `5'10" (177 cm)`, `6'0" (182 cm)`, `6'2" (187 cm)`, `6'4" (193 cm)`,
];

export const MARITAL = ['Never Married', 'Widowed', 'Divorced', 'Awaiting Divorce'];

export const BODY_TYPES = ['Slim', 'Average', 'Athletic', 'Heavy'];

export const MOTHER_TONGUES = ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'English', 'Other'];

export const PHYSICAL_STATUS = ['Normal', 'Physically Challenged'];

// --- Contact & Location -----------------------------------------------------
export const RESIDENCY = ['Citizen', 'Permanent Resident', 'Work Permit', 'Student Visa'];

export const STATES = [
  SELECT('Select State'),
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala',
  'Maharashtra', 'Delhi', 'Gujarat', 'West Bengal', 'Others',
];

// --- Community & Astrology --------------------------------------------------
export const SUB_CASTES = [
  SELECT('Select Sub-Caste'),
  'Goldsmith (Achari)', 'Carpenter (Vadrang)', 'Blacksmith (Kammari)',
  'Kamsyalkar (Kammari)', 'Silpi (Kamsyalkar)', 'Sculptor (Silpi)', 'Others',
];

export const RASI = [
  SELECT('Select Rasi'),
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karkataka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)',
  'Dhanusu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

export const NAKSHATRA = [
  SELECT('Select Nakshatra'),
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
  'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
  'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export const PADAM = ['1', '2', '3', '4'];

export const MANGLIK = ['Yes', 'No', "Don't Know"];

// --- Education --------------------------------------------------------------
export const EDUCATION = [
  SELECT('Select Education'),
  'Bachelors', 'Masters', 'PhD', 'BTech', 'BE', 'MBBS', 'MBA', 'CA', 'Diploma', 'Other',
];

// --- Career -----------------------------------------------------------------
export const OCCUPATION = [
  SELECT('Select Occupation'),
  'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Employee',
  'Architect', 'Designer', 'Chartered Accountant', 'Civil Engineer', 'Lawyer',
  'Banker', 'Entrepreneur', 'Not Working', 'Other',
];

export const EMPLOYED_IN = ['Private', 'Government', 'Business', 'Self-Employed', 'Not Working'];

export const SALARY = [
  SELECT('Select Annual Income'),
  'Below 3 Lakhs', '3 - 5 Lakhs', '5 - 8 Lakhs', '8 - 12 Lakhs',
  '12 - 18 Lakhs', '18 - 25 Lakhs', '25 - 35 Lakhs', '35 - 50 Lakhs', 'Above 50 Lakhs',
];

// --- Family -----------------------------------------------------------------
export const FAMILY_TYPE = ['Nuclear Family', 'Joint Family'];
export const FAMILY_VALUES = ['Traditional', 'Moderate', 'Liberal'];
export const FAMILY_STATUS = ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'];

// --- Lifestyle --------------------------------------------------------------
export const DIET = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];
export const SMOKING = ['No', 'Occasionally', 'Yes'];
export const DRINKING = ['No', 'Occasionally', 'Yes'];

// --- Partner Preferences ----------------------------------------------------
export const LOOKING_FOR = ['Bride', 'Groom'];

export const PREF_AGE = ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28',
  '29', '30', '32', '35', '40', '45', '50'];

export const PREF_HEIGHTS = [
  'Any Height', `4'10" (147 cm)`, `5'0" (152 cm)`, `5'2" (157 cm)`, `5'4" (162 cm)`,
  `5'6" (167 cm)`, `5'8" (172 cm)`, `5'10" (177 cm)`, `6'0" (182 cm)`, `6'2" (187 cm)`,
];

export const PREF_MARITAL = ['Any', 'Never Married', 'Widowed', 'Divorced'];

export const PREF_EDUCATION = ['Any Education', 'Bachelors', 'Masters', 'PhD', 'BTech', 'MBBS', 'MBA', 'CA', 'Diploma'];

export const PREF_OCCUPATION = [
  'Any Occupation', 'Software Engineer', 'Doctor', 'Teacher', 'Business Owner',
  'Government Employee', 'Architect', 'Designer', 'Chartered Accountant',
];

export const PREF_DIET = ['Any', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];

// Mock profile until the API exists. First/last name are overridden by the session user.
export const INITIAL_PROFILE = {
  // About Me
  headline: '',
  about: '',

  // Personal Details
  firstName: 'Mahesh',
  lastName: 'Kumar',
  gender: 'Male',
  dob: '1995-05-15',
  height: `5'8" (172 cm)`,
  weight: '',
  maritalStatus: 'Never Married',
  bodyType: 'Average',
  motherTongue: 'Telugu',
  physicalStatus: 'Normal',

  // Contact & Location
  phone: '',
  email: '',
  city: 'Hyderabad',
  state: 'Telangana',
  residency: 'Citizen',

  // Community & Astrology
  caste: 'Viswabrahmin',
  subCaste: 'Goldsmith (Achari)',
  gothram: '',
  rasi: 'Simha (Leo)',
  nakshatra: 'Magha',
  padam: '2',
  manglik: "Don't Know",

  // Education
  education: 'BTech',
  fieldOfStudy: '',
  college: '',

  // Career Information
  occupation: 'Software Engineer',
  employedIn: 'Private',
  company: '',
  income: '12 - 18 Lakhs',
  workLocation: 'Hyderabad',

  // Family Details
  fatherOccupation: '',
  motherOccupation: '',
  siblings: '',
  familyType: 'Nuclear Family',
  familyValues: 'Traditional',
  familyStatus: 'Middle Class',

  // Lifestyle & Interests
  diet: 'Vegetarian',
  smoking: 'No',
  drinking: 'No',
  hobbies: '',

  // Partner Preferences (distinct keys from own attributes)
  lookingFor: 'Bride',
  prefAgeFrom: '24',
  prefAgeTo: '30',
  prefHeightFrom: 'Any Height',
  prefHeightTo: 'Any Height',
  prefMaritalStatus: 'Any',
  prefEducation: 'Any Education',
  prefOccupation: 'Any Occupation',
  prefDiet: 'Any',
  prefLocation: '',

  // Privacy & Settings (booleans)
  profileVisibilityPremium: false,
  photoVisibilityConnections: true,
  contactVisibilityConnections: true,
  showOnlineStatus: true,
};
