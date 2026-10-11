import { useState } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="mt-6 text-center">
          <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-soft dark:bg-brand/10 border border-brand-light/30 dark:border-brand/30 rounded-lg text-brand dark:text-brand-light font-semibold text-sm hover:bg-brand/10 dark:hover:bg-brand/20 transition-colors">
            <i aria-hidden="true" className="fas fa-download" /> Download Horoscope (PDF)
          </button>
        </div>
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
        <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-brand-soft dark:bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4"><i aria-hidden="true" className="fas fa-lock text-2xl text-brand dark:text-brand-light" /></div>
          <h4 className="text-lg font-heading font-bold text-slate-800 dark:text-white mb-2">Contact Details Locked</h4>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-md mx-auto">Upgrade to Gold membership to view phone numbers, email addresses, and connect directly.</p>
          <div className="max-w-xs mx-auto mb-8 space-y-3 opacity-60">
            <div className="bg-slate-300 dark:bg-slate-600 rounded h-5 w-3/4 mx-auto blur-sm" />
            <div className="bg-slate-300 dark:bg-slate-600 rounded h-5 w-1/2 mx-auto blur-sm" />
          </div>
          <Link to="/membership" className="inline-flex items-center justify-center rounded-xl bg-brand hover:bg-brand-dark text-white px-8 py-3 text-sm font-bold shadow-lg shadow-brand/30 transition transform hover:scale-105">
            <i aria-hidden="true" className="fas fa-crown text-gold mr-2" /> Upgrade to Premium
          </Link>
        </div>
      </Transition>
    </div>
  );
}
