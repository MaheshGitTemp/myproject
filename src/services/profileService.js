// Mock "current member" data used by the header, menus and /me.
// Replace with API calls (GET /me, GET /notifications?limit=3) when the backend exists.
export const CURRENT_MEMBER = {
  firstName: 'Mahesh',
  lastName: 'Kumar',
  memberId: 'MAT144',
  tier: 'Gold',
  age: 28,
  location: 'Hyderabad, Telangana',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  photoSmall: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  stats: { views: 142, shortlisted: 18, mutual: 5 },
  unread: { notifications: 3, chat: 5, dashboard: 3 },
};

export const NOTIFICATION_PREVIEW = [
  { id: 1, icon: 'fa-heart', tone: 'pink', unread: true, html: [['b', 'Shruthi'], ' liked your profile'], time: '2 minutes ago' },
  { id: 2, icon: 'fa-comment', tone: 'blue', unread: false, html: [['b', 'Priya'], ' sent you a message'], time: '1 hour ago' },
  { id: 3, icon: 'fa-check', tone: 'green', unread: false, html: ['Your profile is now ', ['b', '100% complete'], '!'], time: 'Yesterday' },
];
