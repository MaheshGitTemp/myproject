// Mock profiles for Matches. Replace with GET /matches/shortlisted and GET /matches/mutual.
export const SHORTLISTED = [
  { uid: 1, name: 'Shruthi', age: 26, location: 'Hyderabad', state: 'Telangana', job: 'Surgeon', height: "5'4\"", weight: '52 kg', education: 'MBBS', caste: 'Goldsmith', rasi: 'Simha', nakshatra: 'Magha', birthTime: '06:30 AM', birthPlace: 'Hyderabad', maritalStatus: 'Never Married', fatherOccupation: 'Business', motherOccupation: 'Homemaker', siblings: '1 Brother', familyType: 'Nuclear Family', about: 'Family-oriented doctor looking for a caring partner who values traditions.', premium: true, verified: true, online: true, isNew: true, lastActive: 'Active 2 mins ago', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'] },
  { uid: 3, name: 'Ananya', age: 28, location: 'Chennai', state: 'Tamil Nadu', job: 'Architect', height: "5'6\"", weight: '58 kg', education: 'Masters', caste: 'Silpi', rasi: 'Kanya', nakshatra: 'Hasta', birthTime: '02:15 PM', birthPlace: 'Chennai', maritalStatus: 'Never Married', fatherOccupation: 'Government Officer', motherOccupation: 'Teacher', siblings: '2 Sisters', familyType: 'Joint Family', about: 'Creative architect passionate about sustainable design.', premium: true, verified: true, online: false, isNew: false, lastActive: 'Active 1 hour ago', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'] },
  { uid: 6, name: 'Lakshmi', age: 25, location: 'Warangal', state: 'Telangana', job: 'Software Engineer', height: "5'3\"", weight: '50 kg', education: 'BTech', caste: 'Kammari', rasi: 'Tula', nakshatra: 'Swati', birthTime: '10:45 AM', birthPlace: 'Warangal', maritalStatus: 'Never Married', fatherOccupation: 'Farmer', motherOccupation: 'Homemaker', siblings: '1 Sister', familyType: 'Nuclear Family', about: 'Tech enthusiast who loves coding, yoga, and family.', premium: false, verified: true, online: true, isNew: true, lastActive: 'Active now', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80'] },
];

export const MUTUALS = [
  { uid: 2, name: 'Priya', age: 24, location: 'Bangalore', state: 'Karnataka', job: 'Software Engineer', height: "5'3\"", weight: '51 kg', education: 'BTech', caste: 'Kammari', rasi: 'Tula', nakshatra: 'Swati', birthTime: '08:20 AM', birthPlace: 'Bangalore', maritalStatus: 'Never Married', fatherOccupation: 'Business', motherOccupation: 'Teacher', siblings: '1 Brother, 1 Sister', familyType: 'Nuclear Family', about: 'Software engineer with a passion for dance and music.', premium: false, verified: true, online: true, isNew: true, lastActive: 'Active now', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'] },
  { uid: 5, name: 'Divya', age: 27, location: 'Warangal', state: 'Telangana', job: 'Doctor', height: "5'4\"", weight: '54 kg', education: 'MBBS', caste: 'Kummari', rasi: 'Mesha', nakshatra: 'Ashwini', birthTime: '04:00 PM', birthPlace: 'Warangal', maritalStatus: 'Never Married', fatherOccupation: 'Doctor', motherOccupation: 'Professor', siblings: '2 Brothers', familyType: 'Joint Family', about: 'Dedicated doctor with a love for music and travel.', premium: true, verified: true, online: false, isNew: false, lastActive: 'Active 3 hours ago', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80'] },
  { uid: 7, name: 'Kavya', age: 26, location: 'Vizag', state: 'Andhra Pradesh', job: 'Teacher', height: "5'5\"", weight: '56 kg', education: 'Masters', caste: 'Carpenter', rasi: 'Meena', nakshatra: 'Revati', birthTime: '12:00 PM', birthPlace: 'Vizag', maritalStatus: 'Never Married', fatherOccupation: 'Business', motherOccupation: 'Homemaker', siblings: '1 Brother', familyType: 'Nuclear Family', about: 'Loves teaching and spending time with family.', premium: false, verified: false, online: true, isNew: true, lastActive: 'Active 5 mins ago', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'] },
];

export const FILTERS = [
  { id: 'all', label: 'All', icon: 'fas fa-globe' },
  { id: 'online', label: 'Online Now', icon: 'fas fa-circle text-green-500' },
  { id: 'new', label: 'New Matches', icon: 'fas fa-sparkles' },
  { id: 'premium', label: 'Premium', icon: 'fas fa-crown' },
  { id: 'verified', label: 'Verified', icon: 'fas fa-check-circle' },
];

// Same rules as the original filterAndSort()
export function applyFilters(list, activeFilters, query) {
  let out = list;
  if (activeFilters.includes('online')) out = out.filter((p) => p.online);
  if (activeFilters.includes('new')) out = out.filter((p) => p.isNew);
  if (activeFilters.includes('premium')) out = out.filter((p) => p.premium);
  if (activeFilters.includes('verified')) out = out.filter((p) => p.verified);
  const q = query.trim().toLowerCase();
  if (q) out = out.filter((p) => [p.name, p.location, p.caste, p.job].some((v) => v.toLowerCase().includes(q)));
  return out;
}

export const MATCHES_DRAWER_ITEMS = [
  { key: 'home', to: '/', icon: 'fa-home', label: 'Home' },
  { key: 'matches', to: '/matches', icon: 'fa-heart', label: 'Matches' },
  { key: 'search', to: '/search', icon: 'fa-search', label: 'Advanced Search' },
  { key: 'dashboard', to: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard', badge: 3 },
  { key: 'chat', to: '/chat', icon: 'fa-comment-dots', label: 'Messages', badge: 5 },
];
