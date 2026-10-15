import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../../ui/Transition.jsx';
import useClickAway from '../../../hooks/useClickAway.js';
import { NOTIFICATION_PREVIEW } from '../../../services/profileService.js';
import * as notificationsService from '../../../services/notificationsService.js';

const TONES = {
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
};
const ANIM = {
  enter: 'transition ease-out duration-200', enterFrom: 'opacity-0 scale-95', enterTo: 'opacity-100 scale-100',
  leave: 'transition ease-in duration-150', leaveFrom: 'opacity-100 scale-100', leaveTo: 'opacity-0 scale-95',
};

// Map a generic-notifications feed row ({id,type,payload,read,createdAt}) into
// the preview item shape the dropdown markup already renders. Unknown types get
// a neutral bell/blue treatment so nothing breaks.
const TYPE_MAP = {
  interest_received: { icon: 'fa-heart', tone: 'pink' },
  message_received: { icon: 'fa-comment', tone: 'blue' },
  interest_accepted: { icon: 'fa-check', tone: 'green' },
};
function toPreview(n) {
  const meta = TYPE_MAP[n.type] || { icon: 'fa-bell', tone: 'blue' };
  const from = (n.payload && n.payload.fromName) || 'Someone';
  const verb = {
    interest_received: ' liked your profile',
    message_received: ' sent you a message',
    interest_accepted: ' accepted your proposal',
  }[n.type] || ' sent you a notification';
  return {
    id: n.id,
    icon: meta.icon,
    tone: meta.tone,
    unread: !n.read,
    html: [['b', from], verb],
    time: n.createdAt || '',
  };
}

// Bell button + dropdown with the latest notifications.
export default function NotificationsMenu({ count, badgeAnimation = 'animate-bounce' }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATION_PREVIEW);
  const ref = useRef(null);
  useClickAway(ref, () => setOpen(false), open);

  // Populate from the live feed; fall back to NOTIFICATION_PREVIEW on failure.
  useEffect(() => {
    let active = true;
    (async () => {
      const res = await notificationsService.getNotifications();
      if (!active || !res.ok || !res.results.length) return;
      // The service already returns NOTIFICATION_PREVIEW-shaped items in the
      // mock-fallback path, so only remap when rows look like live feed rows.
      const mapped = res.results.map((n) => (n.type ? toPreview(n) : n));
      setItems(mapped);
    })();
    return () => {
      active = false;
    };
  }, []);

  const markAllRead = () => {
    notificationsService.markAllRead();
    setItems((list) => list.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="relative w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center" aria-label="Notifications">
        <i aria-hidden="true" className="far fa-bell text-slate-600 dark:text-slate-300" />
        {count > 0 && <span className={`absolute top-1 right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center ${badgeAnimation}`}>{count}</span>}
      </button>
      <Transition show={open} {...ANIM} className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-heading font-bold text-slate-800 dark:text-white">Notifications</h4>
          <button type="button" onClick={markAllRead} className="text-xs text-brand font-semibold hover:underline">Mark all read</button>
        </div>
        <div className="max-h-96 overflow-y-auto hide-scrollbar">
          {items.map((n) => (
            <Link key={n.id} to="/notifications" className={`flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-l-4 ${n.unread ? 'border-brand bg-brand/5' : 'border-transparent'}`}>
              <div className={`w-10 h-10 rounded-full ${TONES[n.tone]} flex items-center justify-center flex-shrink-0`}>
                <i aria-hidden="true" className={`fas ${n.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 dark:text-white">
                  {n.html.map((part, i) => (Array.isArray(part) ? <strong key={i}>{part[1]}</strong> : part))}
                </p>
                <p className="text-xs text-slate-500 mt-1">{n.time}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <Link to="/notifications" className="block text-center text-sm text-brand font-semibold hover:underline">View All Notifications</Link>
        </div>
      </Transition>
    </div>
  );
}
