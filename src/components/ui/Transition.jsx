import { useEffect, useRef, useState } from 'react';

// React equivalent of Alpine's x-show + x-transition.
// Pass the same enter/leave class groups. The element is display:none when
// hidden (like x-show) and stays mounted, so form state inside it is kept.
// There is no animation on first render (same as Alpine).
// Alpine's bare `x-transition` (no modifiers): 150ms fade+scale in, 75ms out.
export const ALPINE_DEFAULT = {
  enter: 'transition ease-out duration-150', enterFrom: 'opacity-0 scale-95', enterTo: 'opacity-100 scale-100',
  leave: 'transition ease-in duration-75', leaveFrom: 'opacity-100 scale-100', leaveTo: 'opacity-0 scale-95',
};

const split = (s) => (s ? s.split(/\s+/).filter(Boolean) : []);

function durationOf(el) {
  const s = getComputedStyle(el);
  const toMs = (v) => Math.max(...v.split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000)), 0);
  return toMs(s.transitionDuration) + toMs(s.transitionDelay);
}

export default function Transition({
  show, as: Tag = 'div', className = '', style,
  enter = '', enterFrom = '', enterTo = '',
  leave = '', leaveFrom = '', leaveTo = '',
  children, ...rest
}) {
  const ref = useRef(null);
  const lastAnimated = useRef(show);
  // Alpine only animates the groups you give it: no leave classes = hide instantly.
  const hasLeave = !!(leave || leaveFrom || leaveTo);

  // Derived state: keep the element displayed while the leave animation runs.
  const [prevShow, setPrevShow] = useState(show);
  const [leaving, setLeaving] = useState(false);
  if (show !== prevShow) {
    setPrevShow(show);
    setLeaving(!show && hasLeave);
  }
  const displayed = show || leaving;

  useEffect(() => {
    const el = ref.current;
    if (!el || lastAnimated.current === show) return undefined;
    lastAnimated.current = show;
    if (!show && !hasLeave) return undefined;

    const [a, b, c] = show ? [enter, enterFrom, enterTo] : [leave, leaveFrom, leaveTo];
    const all = [...split(a), ...split(b), ...split(c)];
    el.classList.add(...split(a), ...split(b));

    let t;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        el.classList.remove(...split(b));
        el.classList.add(...split(c));
        t = setTimeout(() => {
          el.classList.remove(...all);
          if (!show) setLeaving(false);
        }, durationOf(el));
      });
      el.__raf2 = raf2;
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(el.__raf2);
      clearTimeout(t);
      el.classList.remove(...all);
      if (!show) setLeaving(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Tag ref={ref} className={className} style={{ ...style, ...(displayed ? null : { display: 'none' }) }} {...rest}>
      {children}
    </Tag>
  );
}
