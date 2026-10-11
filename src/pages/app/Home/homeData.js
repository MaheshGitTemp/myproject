// Demo profiles for the swipe deck until the "suggested profiles" API exists.
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const PROFILES = [
  { id: 1, matId: 'MAT2087', name: 'Shruthi', age: 26, location: 'Hyderabad', job: 'Surgeon', education: 'MBBS', image: img('photo-1544005313-94ddf0286df2') },
  { id: 2, matId: 'MAT2091', name: 'Priya', age: 24, location: 'Bangalore', job: 'Software Engineer', education: 'BTech', image: img('photo-1534528741775-53994a69daeb') },
  { id: 3, matId: 'MAT2105', name: 'Ananya', age: 28, location: 'Chennai', job: 'Architect', education: 'Masters', image: img('photo-1524504388940-b1c1722653e1') },
];

// "Start Over" in the original brings back only the first two (kept as is).
export const RESET_PROFILES = PROFILES.slice(0, 2);

export const HOME_DRAWER_ITEMS = [
  { key: 'me', to: '/me', icon: 'fa-user', label: 'My Profile' },
  { key: 'dashboard', to: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { key: 'settings', to: '/profile-security', icon: 'fa-cog', label: 'Settings' },
];

export const SWIPE_MS = 300;       // delay before the card leaves the deck
export const DRAG_COMMIT_PX = 100; // drag distance that counts as a swipe
export const DRAG_HINT_PX = 50;    // drag distance that shows the like / skip animation
