// Mock proposals until the API exists.
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=80`;

export const RECEIVED = [
  { id: 1, name: 'Shruthi Rao', age: 26, location: 'Hyderabad', matId: '144', status: 'pending', image: img('photo-1544005313-94ddf0286df2') },
  { id: 2, name: 'Priya Sharma', age: 24, location: 'Bangalore', matId: '156', status: 'accepted', image: img('photo-1534528741775-53994a69daeb') },
  { id: 3, name: 'Ananya Reddy', age: 28, location: 'Chennai', matId: '189', status: 'rejected', image: img('photo-1524504388940-b1c1722653e1') },
  { id: 4, name: 'Kavya Patel', age: 25, location: 'Vizag', matId: '201', status: 'pending', image: img('photo-1531746020798-e6953c6e8e04') },
];

export const SENT = [
  { id: 101, name: 'Divya Kumar', age: 27, location: 'Warangal', matId: '112', status: 'accepted', image: img('photo-1488426862026-3ee34a7d66df') },
  { id: 102, name: 'Lakshmi Nair', age: 25, location: 'Kochi', matId: '134', status: 'pending', image: img('photo-1517841905240-472988babdf9') },
];

// Phone pills on this page differ from the other account pages.
export const NOTIFICATION_PILLS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'edit-profile', label: 'Edit Profile' },
  { key: 'profile-security', label: 'Security', icon: 'fa-shield-alt' },
];
