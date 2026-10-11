// Settings groups and demo data for Privacy & Security (copied from profile-security.html / .js).
// `key` is the field in the settings state; `initial` is its starting value.

export const DEFAULT_SETTINGS = {
  hideProfile: false, blurPhotos: true, hideContact: true, incognito: false,
  emailNotifs: true, smsNotifs: false, marketing: false,
  twoFactor: false, loginAlerts: true,
};

export const PRIVACY_ROWS = [
  { key: 'hideProfile', title: 'Hide My Profile', description: "Your profile won't appear in search results." },
  { key: 'blurPhotos', title: 'Blur Photos for Free Users', description: 'Only premium members can see your photos clearly.' },
  { key: 'hideContact', title: 'Hide Contact Information', description: 'Phone number and email are hidden from everyone.' },
  { key: 'incognito', title: 'Browse Incognito', description: 'View profiles without them knowing you visited.' },
];

export const COMMUNICATION_ROWS = [
  { key: 'emailNotifs', title: 'Email Notifications', description: 'Receive updates about proposals and messages.' },
  { key: 'smsNotifs', title: 'SMS Alerts', description: 'Get text messages for important account activity.' },
  { key: 'marketing', title: 'Marketing Emails', description: 'Receive tips, success stories, and offers.' },
];

export const SECURITY_ROWS = [
  { key: 'twoFactor', title: 'Two-Factor Authentication (2FA)', description: 'Add an extra layer of security to your account.' },
  { key: 'loginAlerts', title: 'Login Alerts', description: 'Get notified when someone logs into your account.' },
];

export const BLOCKED_USERS = [
  { id: 1, name: 'Rahul Verma', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', date: 'Oct 12, 2023' },
  { id: 2, name: 'Anonymous User', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', date: 'Sep 28, 2023' },
];
