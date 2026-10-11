// Which rows each tab shows. [label, profile field, showGreenDot?]
export const ABOUT_ROWS = [
  ['Marital Status', 'maritalStatus'], ['Diet', 'diet', true], ['Education', 'education'],
  ['Occupation', 'occupation'], ['Annual Income', 'income'], ['Height', 'height'],
];
export const FAMILY_ROWS = [
  ['Caste / Community', 'caste'], ['Sub-Caste', 'subCaste'], ['Family Type', 'familyType'],
  ["Father's Occupation", 'fatherOccupation'], ["Mother's Occupation", 'motherOccupation'], ['Siblings', 'siblings'],
];
export const ASTRO_ROWS = [
  ['Rasi', 'rasi'], ['Nakshatra', 'nakshatra'], ['Padam', 'padam'],
  ['Date of Birth', 'dob'], ['Time of Birth', 'tob'], ['Place of Birth', 'pob'],
];

export const TABS = [
  { key: 'about', icon: 'fa-user', label: 'About' },
  { key: 'family', icon: 'fa-users', label: 'Family' },
  { key: 'astrology', icon: 'fa-star', label: 'Astrology' },
  { key: 'gallery', icon: 'fa-images', label: 'Gallery' },
  { key: 'contact', icon: 'fa-phone', label: 'Contact' },
];

export const ACTIONS = [
  { icon: 'fa-heart', label: 'Send Interest', tone: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { icon: 'fa-bookmark', label: 'Shortlist', tone: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { icon: 'fa-comment-dots', label: 'Message', tone: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
];
