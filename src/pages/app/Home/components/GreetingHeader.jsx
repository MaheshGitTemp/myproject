// Warm, left-aligned greeting for the matrimonial landing feed.
// `name` is the session first name; when absent, the greeting renders without a name.
function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function GreetingHeader({ name }) {
  const greeting = timeOfDay();
  return (
    <div className="mb-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1">
        {greeting}
        {name ? (
          <>
            , <span className="gradient-text">{name}</span>
          </>
        ) : null}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm">Here are your matches for today.</p>
    </div>
  );
}
