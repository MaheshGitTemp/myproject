import { useEffect } from 'react';

// Calls `handler` when a click lands outside `ref` (Alpine's @click.away). Only listens while `active`.
export default function useClickAway(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(e); };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [ref, handler, active]);
}
