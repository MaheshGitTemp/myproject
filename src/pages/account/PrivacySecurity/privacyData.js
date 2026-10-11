// Mock settings + blocked users (copied from profile-security.js). Replace with API data later.
export const INITIAL_PRIVACY = {
  hideProfile: false,
  blurPhotos: true,
  hideContact: true,
  incognito: false,
  emailNotifs: true,
  smsNotifs: false,
  marketing: false,
  twoFactor: false,
  loginAlerts: true,
};

export const INITIAL_BLOCKED = [
  { id: 1, name: 'Rahul Verma', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', date: 'Oct 12, 2023' },
  { id: 2, name: 'Anonymous User', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', date: 'Sep 28, 2023' },
];

// Settings cards. `rows` are toggles; keys refer to INITIAL_PRIVACY.
export const SECTIONS = [
  {
    title: 'Profile Privacy', icon: 'fa-user-shield',
    rows: [
      { key: 'hideProfile', title: 'Hide My Profile', description: "Your profile won't appear in search results." },
      { key: 'blurPhotos', title: 'Blur Photos for Free Users', description: 'Only premium members can see your photos clearly.' },
      { key: 'hideContact', title: 'Hide Contact Information', description: 'Phone number and email are hidden from everyone.' },
      { key: 'incognito', title: 'Browse Incognito', description: 'View profiles without them knowing you visited.' },
    ],
  },
  {
    title: 'Communication Preferences', icon: 'fa-bell',
    rows: [
      { key: 'emailNotifs', title: 'Email Notifications', description: 'Receive updates about proposals and messages.' },
      { key: 'smsNotifs', title: 'SMS Alerts', description: 'Get text messages for important account activity.' },
      { key: 'marketing', title: 'Marketing Emails', description: 'Receive tips, success stories, and offers.' },
    ],
  },
  {
    title: 'Account Security', icon: 'fa-lock', withPasswordLink: true,
    rows: [
      { key: 'twoFactor', title: 'Two-Factor Authentication (2FA)', description: 'Add an extra layer of security to your account.' },
      { key: 'loginAlerts', title: 'Login Alerts', description: 'Get notified when someone logs into your account.' },
    ],
  },
];
