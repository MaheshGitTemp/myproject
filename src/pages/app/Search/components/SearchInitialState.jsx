// Pre-search discovery state: an inviting prompt panel shown before the first
// search runs. TrendingNow is composed alongside it in Search.jsx.
export default function SearchInitialState() {
  return (
    <div className="text-center py-16 px-6 glass rounded-3xl max-w-lg mx-auto card-shadow animate-fade-in">
      <div className="relative inline-block mb-6">
        <div className="w-28 h-28 bg-gradient-to-br from-brand-soft to-rose-100 dark:from-brand/20 dark:to-brand/10 rounded-full flex items-center justify-center mx-auto animate-float">
          <i aria-hidden="true" className="fas fa-search-location text-5xl text-brand" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <i aria-hidden="true" className="fas fa-heart text-white text-sm" />
        </div>
      </div>
      <h3 className="text-2xl font-heading font-bold mb-2">Start Your Search</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Set your preferences and search to find matches tailored to you.
      </p>
    </div>
  );
}
