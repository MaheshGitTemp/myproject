// Mock conversations until the chat API / websocket exists.
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=100&q=80`;

export const CHAT_DRAWER_ITEMS = [
  { key: 'home', to: '/', icon: 'fa-home', label: 'Home' },
  { key: 'matches', to: '/matches', icon: 'fa-heart', label: 'Matches' },
  { key: 'search', to: '/search', icon: 'fa-search', label: 'Advanced Search' },
  { key: 'chat', to: '/chat', icon: 'fa-comment-dots', label: 'Messages', badge: 5 },
];

export const CONVERSATIONS = [
  { id: 1, name: 'Shruthi', avatar: img('photo-1544005313-94ddf0286df2'), online: true, unread: 2, lastMessage: 'That sounds wonderful! Let me know the details.', lastMessageTime: '10:42 AM', messages: [
    { id: 1, text: 'Hello! I saw your profile and loved your interests.', isSent: false, time: '10:30 AM', read: true },
    { id: 2, text: 'Hi Shruthi! Thank you. I noticed you enjoy classical music too.', isSent: true, time: '10:35 AM', read: true },
    { id: 3, text: 'Yes! I attend concerts whenever I can. Do you play any instruments?', isSent: false, time: '10:40 AM', read: true },
    { id: 4, text: 'That sounds wonderful! Let me know the details.', isSent: false, time: '10:42 AM', read: false },
  ] },
  { id: 2, name: 'Priya', avatar: img('photo-1534528741775-53994a69daeb'), online: false, unread: 0, lastMessage: 'Thanks for connecting!', lastMessageTime: 'Yesterday', messages: [
    { id: 1, text: 'Hi Priya, happy to connect with you.', isSent: true, time: 'Yesterday', read: true },
    { id: 2, text: 'Thanks for connecting!', isSent: false, time: 'Yesterday', read: true },
  ] },
  { id: 3, name: 'Ananya', avatar: img('photo-1524504388940-b1c1722653e1'), online: true, unread: 1, lastMessage: 'Are you free this weekend for a quick call?', lastMessageTime: 'Yesterday', messages: [
    { id: 1, text: 'Hi Ananya, your profile is very impressive.', isSent: true, time: 'Yesterday', read: true },
    { id: 2, text: 'Thank you! I appreciate that.', isSent: false, time: 'Yesterday', read: true },
    { id: 3, text: 'Are you free this weekend for a quick call?', isSent: false, time: 'Yesterday', read: false },
  ] },
];
