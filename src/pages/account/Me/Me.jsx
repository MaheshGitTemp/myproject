import { Link } from 'react-router-dom';
import usePageMeta from '../../../hooks/usePageMeta.js';
import MainLayout from '../../../layouts/MainLayout.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { FALLBACK_MEMBER } from '../../../services/accountService.js';
import { SETTINGS_LINKS, TONES } from './meData.js';

export default function Me() {
  usePageMeta({
    title: 'My Account | Telugu Sambandham',
    description: 'Manage your Telugu Sambandham profile, privacy and account settings.',
    robots: 'noindex, nofollow',
  });

  const { member } = useAuth();
  const m = member || FALLBACK_MEMBER;

  return (
    <MainLayout active="me">
      {({ askLogout }) => (
        <>
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">My <span className="gradient-text">Profile</span></h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your account, preferences, and settings.</p>
          </div>

          <div className="glass rounded-3xl p-6 card-shadow mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img loading="lazy" decoding="async" alt="Profile photo" src={m.photo} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg" />
              {m.premium && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-gold text-white text-[10px] font-bold rounded-full shadow">PREMIUM</span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-heading font-bold">{m.firstName} {m.lastName}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-3">{m.age} yrs • {m.location} • {m.memberId}</p>
              <Link to="/edit-profile" className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl font-semibold text-sm transition"><i aria-hidden="true" className="fas fa-pen" /> Edit Profile</Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[[m.stats.views, 'Profile Views'], [m.stats.shortlisted, 'Shortlisted'], [m.stats.mutual, 'Mutual Matches']].map(([n, label]) => (
              <div key={label} className="glass rounded-2xl p-4 text-center card-shadow">
                <div className="text-2xl font-bold text-brand">{n}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-brand to-brand-dark rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><i aria-hidden="true" className="fas fa-crown text-gold" /> Upgrade to Gold</h3>
                <p className="text-white/80 text-sm">View contact details of unlimited profiles and get priority listing.</p>
              </div>
              <Link to="/membership" className="px-6 py-3 bg-white text-brand font-bold rounded-xl shadow-lg hover:bg-slate-100 transition whitespace-nowrap">Upgrade Now</Link>
            </div>
          </div>

          <div className="glass rounded-3xl overflow-hidden card-shadow divide-y divide-slate-200 dark:divide-slate-700">
            {SETTINGS_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${TONES[l.tone]} flex items-center justify-center`}><i aria-hidden="true" className={`fas ${l.icon}`} /></div>
                  <div><div className="font-semibold">{l.title}</div><div className="text-xs text-slate-500">{l.hint}</div></div>
                </div>
                <i aria-hidden="true" className="fas fa-chevron-right text-slate-400" />
              </Link>
            ))}
            <button type="button" onClick={askLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-600">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center"><i aria-hidden="true" className="fas fa-sign-out-alt" /></div>
                <div className="text-left"><div className="font-semibold">Logout</div><div className="text-xs text-red-400">Sign out of your account</div></div>
              </div>
              <i aria-hidden="true" className="fas fa-chevron-right" />
            </button>
          </div>
        </>
      )}
    </MainLayout>
  );
}
