// Decorative blurred blobs behind the page.
// variant "rich" is the 3-shape version with slower pulse used on Matches / Search / Chat.
export default function FloatingShapes({ variant = 'basic' }) {
  const pulse = variant === 'rich' ? 'animate-pulse-slow' : 'animate-pulse';
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className={`floating-shape w-96 h-96 bg-brand-light top-0 -left-20 ${pulse}`} />
      <div className={`floating-shape w-80 h-80 bg-rose-300 bottom-0 -right-20 ${pulse}`} style={{ animationDelay: '1s' }} />
      {variant === 'rich' && <div className="floating-shape w-64 h-64 bg-gold/20 top-1/2 left-1/2 animate-float" />}
    </div>
  );
}
