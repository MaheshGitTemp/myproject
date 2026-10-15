import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../context/ToastContext.jsx';
import { report, sendInterest, shortlist } from '../../../../services/matchesService.js';
import { ACTIONS } from '../profileDetailsData.js';

const locationLine = (p) => [p.city, p.state].filter(Boolean).join(', ');
const summaryLine = (p) => [p.age ? `${p.age} yrs` : '', p.height, p.occupation, locationLine(p)].filter(Boolean).join(' • ');

export function ProfileHeaderCard({ profile: p }) {
  return (
    <div className="glass rounded-3xl p-6 card-shadow mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
      <div className="relative flex-shrink-0">
        <img loading="lazy" decoding="async" src={p.image} alt={p.fullName} className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-slate-700 shadow-lg" />
        {p.online && (
          <span className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1.5 ring-2 ring-white dark:ring-slate-800" title="Online Now">
            <i aria-hidden="true" className="fas fa-check text-[10px]" />
          </span>
        )}
      </div>
      <div className="text-center md:text-left flex-1">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <h1 className="text-2xl font-heading font-bold text-slate-800 dark:text-white">{p.fullName}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2">
            {p.premium && (
              <span className="bg-gold/10 text-gold dark:text-gold text-xs font-bold px-2.5 py-0.5 rounded-full border border-gold/20 flex items-center gap-1">
                <i aria-hidden="true" className="fas fa-crown text-[10px]" /> PREMIUM
              </span>
            )}
            {p.online && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
              </span>
            )}
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-3 font-medium">{summaryLine(p)}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 inline-block px-3 py-1.5 rounded-lg">
          MAT ID: <span>{p.id}</span> • <span className="text-gold font-semibold">{p.membership}</span>
        </p>
      </div>
    </div>
  );
}

// The four action buttons: Send Interest, Shortlist, Message (nav to chat) and
// Report. All WRITE endpoints are keyed by the MAT id string (p.matId||p.id).
export function ActionRow({ profile: p }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const matId = p?.matId || p?.id;

  const onAction = (label) => {
    if (label === 'Send Interest') {
      sendInterest(matId);
      showToast('Interest Sent', `Your interest has been sent to ${p.name || p.fullName || 'this member'}!`);
    } else if (label === 'Shortlist') {
      shortlist(matId);
      showToast('Shortlisted', `${p.name || p.fullName || 'This member'} added to your shortlist!`);
    } else if (label === 'Message') {
      navigate('/chat');
    }
  };

  const onReport = () => {
    report(matId, 'reported_from_profile');
    showToast('Reported', 'Thank you. Our team will review this profile.');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {ACTIONS.map((a) => (
        <button key={a.label} type="button" onClick={() => onAction(a.label)} className="glass rounded-xl p-3 card-shadow hover:shadow-lg transition flex flex-col items-center text-center gap-2 group">
          <div className={`w-10 h-10 rounded-full ${a.tone} flex items-center justify-center group-hover:scale-110 transition`}><i aria-hidden="true" className={`fas ${a.icon}`} /></div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{a.label}</span>
        </button>
      ))}
      <button type="button" onClick={onReport} className="glass rounded-xl p-3 card-shadow hover:shadow-lg transition flex flex-col items-center text-center gap-2 group hover:bg-red-50 dark:hover:bg-red-900/20">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center group-hover:scale-110 transition"><i aria-hidden="true" className="fas fa-flag" /></div>
        <span className="text-xs font-bold text-red-600">Report</span>
      </button>
    </div>
  );
}
