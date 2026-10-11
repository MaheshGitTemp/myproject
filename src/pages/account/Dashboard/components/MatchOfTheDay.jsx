import { Link } from 'react-router-dom';

export default function MatchOfTheDay({ match }) {
  return (
    <div className="glass rounded-2xl p-6 card-shadow flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i aria-hidden="true" className="fas fa-star text-gold" /> Match of the Day
      </h3>
      <div className="relative rounded-xl overflow-hidden mb-4 group">
        <img loading="lazy" decoding="async" src={match.photo} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" alt="Match" />
        {match.online && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <i aria-hidden="true" className="fas fa-circle text-[8px]" /> Online
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{match.name}</h4>
          <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded-lg">{match.compatibility}</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4"><i aria-hidden="true" className="fas fa-briefcase mr-1" /> {match.job}</p>

        <div className="flex gap-2 mt-auto">
          <Link to={match.profileLink} className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition flex items-center justify-center gap-2 text-sm">
            <i aria-hidden="true" className="fas fa-eye" /> View Profile
          </Link>
          <button type="button" className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-brand hover:text-white transition" aria-label="Like">
            <i aria-hidden="true" className="fas fa-heart" />
          </button>
        </div>
      </div>
    </div>
  );
}
