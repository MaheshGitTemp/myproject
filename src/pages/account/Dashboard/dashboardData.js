// Mock dashboard data (copied from dashboard.html). Replace with an API call later.
// Class strings are written out in full so Tailwind can see them.

export const STATS = [
  { label: 'Proposals Received', value: 12, icon: 'fa-envelope-open-text', iconClass: 'text-brand', bgClass: 'bg-brand-soft dark:bg-brand/20' },
  { label: 'Proposals Sent', value: 8, icon: 'fa-paper-plane', iconClass: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Mutual Matches', value: 3, icon: 'fa-heart', iconClass: 'text-green-500', bgClass: 'bg-green-50 dark:bg-green-900/20' },
  { label: 'Profile Views', value: 128, icon: 'fa-eye', iconClass: 'text-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-900/20' },
];

export const QUICK_ACTIONS = [
  { to: '/notifications', icon: 'fa-users', title: 'Who Viewed Me', note: '12 new', colorClass: 'text-brand', noteClass: 'text-brand' },
  { to: '/matches', icon: 'fa-bookmark', title: 'My Shortlists', note: '5 profiles', colorClass: 'text-blue-500', noteClass: 'text-blue-500' },
  { to: '/membership', icon: 'fa-rocket', title: 'Boost Profile', note: 'Get 3x views', colorClass: 'text-purple-500', noteClass: 'text-purple-500' },
  { to: '/membership', icon: 'fa-crown', title: 'Upgrade Plan', note: 'Unlock contacts', colorClass: 'text-gold', noteClass: 'text-gold', extraClass: 'border-gold/30 dark:border-gold/20' },
];

export const STATUS_CLASS = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const RECENT_ACTIVITY = [
  { name: 'Shruthi Rao', alt: 'Shruthi', meta: 'MAT144 • 26 yrs • Hyderabad', status: 'Pending', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
  { name: 'Priya Sharma', alt: 'Priya', meta: 'MAT156 • 24 yrs • Bangalore', status: 'Accepted', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
  { name: 'Ananya Reddy', alt: 'Ananya', meta: 'MAT189 • 28 yrs • Chennai', status: 'Rejected', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
];

export const MATCH_OF_THE_DAY = {
  name: 'Shruthi, 26',
  compatibility: '94% Compatible',
  job: 'Surgeon • Hyderabad',
  online: true,
  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  profileLink: '/profile-details',
};
