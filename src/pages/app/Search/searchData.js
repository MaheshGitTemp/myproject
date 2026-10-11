export const DEFAULT_FILTERS = {
  gender: 'Female', ageFrom: '21', ageTo: '30', maritalStatus: '', heightFrom: '', caste: '', rasi: '', nakshatra: '',
  education: '', occupation: '', country: 'India', state: '', city: '', annualIncome: '', page: 1, limit: 10,
};

export const SORTS = [
  { id: 'recent', icon: 'fa-clock', label: 'Most Recent' },
  { id: 'match', icon: 'fa-percentage', label: 'Highest Match' },
  { id: 'age-low', icon: 'fa-sort-amount-up', label: 'Age: Low to High' },
  { id: 'age-high', icon: 'fa-sort-amount-down', label: 'Age: High to Low' },
  { id: 'name', icon: 'fa-font', label: 'Name A–Z' },
  { id: 'location', icon: 'fa-map-marker-alt', label: 'Location A–Z' },
];

export const AGE_FROM = ['18', '21', '25', '30'];
export const AGE_TO = ['25', '30', '35', '40'];
export const HEIGHTS = ['5\'0"', '5\'2"', '5\'4"', '5\'6"', '5\'8"', '5\'10"', '6\'0"'];
export const MARITAL = ['Single', 'Widowed', 'Divorced'];
export const CASTES = ['Goldsmith', 'Carpenter', 'Kammari', 'Kummari', 'Silpi', 'Others'];
export const RASIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karkataka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanusu', 'Makara', 'Kumbha', 'Meena'];
export const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha'];
export const EDUCATION = ['Bachelors', 'Masters', 'PhD', 'BTech', 'MBBS', 'MBA', 'CA', 'Diploma'];
export const OCCUPATIONS = ['Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Employee', 'Architect', 'Designer'];
export const COUNTRIES = ['India', 'USA', 'UAE', 'UK', 'Canada', 'Australia'];
export const STATES = ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu'];

const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=100&q=80`;
export const TRENDING = [
  { matId: 'MAT2087', name: 'Shruthi', info: '26, Hyderabad', image: IMG('1544005313-94ddf0286df2') },
  { matId: 'MAT2091', name: 'Priya', info: '24, Bangalore', image: IMG('1534528741775-53994a69daeb') },
  { matId: 'MAT2105', name: 'Ananya', info: '28, Chennai', image: IMG('1524504388940-b1c1722653e1') },
  { matId: 'MAT2118', name: 'Kavya', info: '26, Vizag', image: IMG('1517841905240-472988babdf9') },
];

export const SEARCH_DRAWER_ITEMS = [
  { key: 'home', to: '/', icon: 'fa-home', label: 'Home' },
  { key: 'matches', to: '/matches', icon: 'fa-heart', label: 'Matches' },
  { key: 'search', to: '/search', icon: 'fa-search', label: 'Advanced Search' },
  { key: 'chat', to: '/chat', icon: 'fa-comment-dots', label: 'Messages' },
];
