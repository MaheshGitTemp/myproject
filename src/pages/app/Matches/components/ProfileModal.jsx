import { useState } from 'react';
import Transition, { ALPINE_DEFAULT } from '../../../../components/ui/Transition.jsx';

const FADE = {
  enter: 'transition ease-out duration-150', enterFrom: 'opacity-0', enterTo: 'opacity-100',
  leave: 'transition ease-in duration-75', leaveFrom: 'opacity-100', leaveTo: 'opacity-0',
};
const TABS = [
  { id: 'about', icon: 'fa-user', label: 'About' },
  { id: 'details', icon: 'fa-info-circle', label: 'Details' },
  { id: 'family', icon: 'fa-home', label: 'Family' },
  { id: 'astro', icon: 'fa-star', label: 'Astrology' },
  { id: 'contact', icon: 'fa-phone', label: 'Contact' },
];

function Fact({ icon, label, value }) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1"><i aria-hidden="true" className={`fas ${icon} mr-2`} />{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Body({ profile: p, onClose, onRemove, onShortlist, onMessage }) {
  const [tab, setTab] = useState('about');
  const [photo, setPhoto] = useState(0);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center"><i aria-hidden="true" className="fas fa-user text-brand text-xl" /></div>
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-800 dark:text-white"><span>{p.name}</span>, <span>{p.age}</span> {p.verified && <i aria-hidden="true" className="fas fa-check-circle text-green-500 text-sm ml-2" />}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">MAT<span>{p.uid}</span> • <span>{p.caste}</span></p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition" aria-label="Close"><i aria-hidden="true" className="fas fa-times text-slate-600 dark:text-slate-300" /></button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="relative bg-slate-100 dark:bg-slate-800">
          <div className="flex overflow-x-auto gallery-slide hide-scrollbar">
            {p.gallery.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-full md:w-1/2 aspect-[3/4] relative"><img loading="lazy" decoding="async" src={img} className="w-full h-full object-cover" alt={`Photo ${i + 1}`} /></div>
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {p.gallery.map((_, i) => (
              <button key={i} type="button" onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} className={`w-2 h-2 rounded-full transition-all ${i === photo ? 'bg-white w-6' : 'bg-white/50'}`} />
            ))}
          </div>
          {p.online && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-full shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full online-dot" />
              <span className="text-white text-xs font-bold">Online Now</span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2"><i aria-hidden="true" className="fas fa-map-marker-alt text-brand" /><span className="text-slate-600 dark:text-slate-300">{`${p.location}, ${p.state}`}</span></div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 bg-brand/10 dark:bg-brand/20 rounded-full text-sm font-semibold text-brand"><i aria-hidden="true" className="fas fa-users mr-1" /><span>{p.caste}</span></span>
              <span className="px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full text-sm font-bold"><i aria-hidden="true" className="fas fa-leaf mr-1" />Pure Veg</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto hide-scrollbar">
              {TABS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`${tab === t.id ? 'tab-active' : 'tab-inactive'} pb-3 font-semibold whitespace-nowrap transition`}>
                  <i aria-hidden="true" className={`fas ${t.icon} mr-2`} />{t.label}
                </button>
              ))}
            </div>

            {tab === 'about' && (
              <div className="space-y-4">
                <div><h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About Me</h4><p className="text-slate-700 dark:text-slate-300 leading-relaxed">{p.about}</p></div>
              </div>
            )}
            {tab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Fact icon="fa-briefcase" label="Profession" value={p.job} />
                <Fact icon="fa-graduation-cap" label="Education" value={p.education} />
                <Fact icon="fa-ruler-vertical" label="Height" value={p.height} />
                <Fact icon="fa-weight" label="Weight" value={p.weight || 'Not specified'} />
                <Fact icon="fa-heart" label="Marital Status" value={p.maritalStatus || 'Never Married'} />
                <Fact icon="fa-utensils" label="Diet" value="Pure Vegetarian" />
              </div>
            )}
            {tab === 'family' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Fact icon="fa-user-tie" label="Father" value={p.fatherOccupation || 'Business'} />
                  <Fact icon="fa-user" label="Mother" value={p.motherOccupation || 'Homemaker'} />
                  <Fact icon="fa-users" label="Siblings" value={p.siblings || '1 Brother, 1 Sister'} />
                  <Fact icon="fa-home" label="Family Type" value={p.familyType || 'Nuclear Family'} />
                </div>
              </div>
            )}
            {tab === 'astro' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Fact icon="fa-star" label="Rasi" value={p.rasi} />
                <Fact icon="fa-moon" label="Nakshatra" value={p.nakshatra || 'Not specified'} />
                <Fact icon="fa-clock" label="Time of Birth" value={p.birthTime || 'Not specified'} />
                <Fact icon="fa-map-marker-alt" label="Place of Birth" value={p.birthPlace || p.location} />
              </div>
            )}
            {tab === 'contact' && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-brand/5 to-brand-light/5 dark:from-brand/10 dark:to-brand-light/10 rounded-xl border border-brand/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center"><i aria-hidden="true" className="fas fa-lock text-brand text-xl" /></div>
                    <div><h4 className="font-bold">Contact Details Locked</h4><p className="text-sm text-slate-600 dark:text-slate-400">Upgrade to premium to view contact information</p></div>
                  </div>
                  <button type="button" className="w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition flex items-center justify-center gap-2"><i aria-hidden="true" className="fas fa-crown" /> Upgrade to Premium</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
        <button type="button" onClick={() => onRemove(p.uid)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl font-semibold transition flex items-center justify-center gap-2"><i aria-hidden="true" className="far fa-trash-alt" /> Remove</button>
        <button type="button" onClick={() => onShortlist(p)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-gold/10 hover:text-gold rounded-xl font-semibold transition flex items-center justify-center gap-2"><i aria-hidden="true" className="far fa-bookmark" /> Shortlist</button>
        <button type="button" onClick={() => onMessage(p)} className="flex-[2] py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition flex items-center justify-center gap-2"><i aria-hidden="true" className="far fa-comment-dots" /> Send Message</button>
      </div>
    </div>
  );
}

// Full profile popup. `profile` null = closed. Content is only rendered while a profile is selected
// (like the original x-if), so tab and photo state reset on every open.
export default function ProfileModal({ profile, onClose, ...actions }) {
  return (
    <Transition show={!!profile} {...FADE} className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md modal-backdrop" onClick={onClose} />
      <Transition show={!!profile} {...ALPINE_DEFAULT} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 md:rounded-3xl shadow-2xl flex flex-col modal-content-desktop">
        {profile && <Body key={profile.uid} profile={profile} onClose={onClose} {...actions} />}
      </Transition>
    </Transition>
  );
}
