import { useState } from 'react';
import Transition from '../../../../components/ui/Transition.jsx';
import { ABOUT_ROWS, ASTRO_ROWS, FAMILY_ROWS, TABS } from '../profileDetailsData.js';

// Same enter animation as the original tab panels (no leave: the old panel hides instantly)
const ENTER = { enter: 'transition ease-out duration-300', enterFrom: 'opacity-0 translate-y-2', enterTo: 'opacity-100 translate-y-0' };
const H3 = 'text-lg font-heading font-bold text-slate-800 dark:text-white';

function Rows({ profile, rows }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
      {rows.map(([label, field, dot]) => (
        <div key={label} className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
          <span className="text-slate-800 dark:text-white font-medium text-sm flex items-center gap-1.5">
            {dot && <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />}
            <span>{profile[field] || '—'}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProfileTabs({ profile: p }) {
  const [tab, setTab] = useState('about');
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const first = (p.name || '').split(' ')[0];
  const c = p.compatibility;
  const panel = (key) => ({ show: tab === key, className: 'p-6', ...ENTER });

  return (
    <div className="glass rounded-2xl card-shadow overflow-hidden mb-8">
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 overflow-x-auto hide-scrollbar">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`tab-btn flex-1 py-4 px-4 text-sm font-semibold transition-colors relative whitespace-nowrap flex items-center justify-center gap-2${tab === t.key ? ' active' : ''}`}>
            <i aria-hidden="true" className={`fas ${t.icon}`} /> <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <Transition {...panel('about')}>
        <h3 className={`${H3} mb-3`}>About <span>{first}</span></h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{p.about}</p>
        <h3 className={`${H3} mb-4`}>Basic Details</h3>
        <Rows profile={p} rows={ABOUT_ROWS} />
      </Transition>

      <Transition {...panel('family')}>
        <h3 className={`${H3} mb-4`}>Family Background</h3>
        <Rows profile={p} rows={FAMILY_ROWS} />
      </Transition>

      <Transition {...panel('astrology')}>
        <h3 className={`${H3} mb-4`}>Horoscope Details</h3>
        <div className="bg-brand-soft dark:bg-brand/10 border border-brand-light/30 dark:border-brand/30 rounded-xl p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-gradient rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"><i aria-hidden="true" className="fas fa-star text-white text-xl" /></div>
          <div>
            <p className="text-sm text-brand dark:text-brand-light font-semibold">Ashta Koota Compatibility</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              <span>{c ? `${c.score} / ${c.total}` : 'N/A'}</span>{' '}
              {c && <span className="text-sm font-normal text-green-600 dark:text-green-400">{`(${c.label})`}</span>}
            </p>
          </div>
        </div>
        <Rows profile={p} rows={ASTRO_ROWS} />
      </Transition>

      <Transition {...panel('gallery')}>
        <h3 className={`${H3} mb-4`}>Photo Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(p.gallery || []).map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 group cursor-pointer">
              <img loading="lazy" decoding="async" src={photo} alt={`${p.name} photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="watermark">{p.id}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center flex items-center justify-center gap-1">
          <i aria-hidden="true" className="fas fa-shield-halved" /> Photos are watermarked to protect user privacy.
        </p>
      </Transition>

      <Transition {...panel('contact')}>
        <h3 className={`${H3} mb-4`}>Contact Details</h3>
        {!contactUnlocked ? (
          <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <p className="text-lg font-heading font-bold text-slate-800 dark:text-white mb-2">🎉 Launch Offer</p>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm max-w-md mx-auto">Unlock this member's contact details at no cost.</p>
            <p className="mb-6 text-base">
              <span className="line-through text-slate-400 dark:text-slate-500 mr-2">₹25</span>
              <span className="text-green-600 dark:text-green-400 font-bold">Free for You</span>
            </p>
            <button type="button" onClick={() => setContactUnlocked(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark text-white px-8 py-3 text-sm font-bold shadow-lg shadow-brand/30 transition transform hover:scale-105 min-h-[44px]">
              <i aria-hidden="true" className="fas fa-unlock" /> View Contact Details
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-8 border border-green-200 dark:border-green-800">
            <p className="text-base font-bold text-green-600 dark:text-green-400 mb-6 flex items-center gap-2"><span>✅</span> Contact Information Unlocked</p>
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Phone Number</span>
                <span className="text-slate-800 dark:text-white font-semibold text-sm">+91 98765 43210</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Email</span>
                <span className="text-slate-800 dark:text-white font-semibold text-sm">member@email.com</span>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}
