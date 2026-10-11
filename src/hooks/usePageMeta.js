import { useEffect } from 'react';

// Per-page <title>, meta description and robots (each original HTML page had its own).
// Logged-in pages pass robots: 'noindex, nofollow'.
export default function usePageMeta({ title, description, robots = 'index, follow' }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    }
    document.querySelector('meta[name="robots"]')?.setAttribute('content', robots);
  }, [title, description, robots]);
}
