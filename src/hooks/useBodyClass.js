import { useLayoutEffect } from 'react';

// Puts classes on <body> while the page is mounted. The original pages style <body> itself, so the
// background also covers content that overflows the viewport (a wrapper div would not).
export default function useBodyClass(classes) {
  useLayoutEffect(() => {
    const list = classes.split(/\s+/).filter(Boolean);
    document.body.classList.add(...list);
    return () => document.body.classList.remove(...list);
  }, [classes]);
}
