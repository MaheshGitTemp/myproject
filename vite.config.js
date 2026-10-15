import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve on 127.0.0.1 (not localhost) so the browser page origin matches the API
// host (VITE_API_BASE=http://127.0.0.1:4000). Same-host keeps the session cookie
// (sameSite:'lax') attached on authed calls — otherwise a localhost page + a
// 127.0.0.1 API are different sites and the cookie is dropped (causing 401s).
//
// The /api dev proxy makes same-origin /api requests reach the backend on :4000.
// This matters for <img src="/api/photos/file/:id"> requests: an image subresource
// is NOT a top-level navigation, and a cross-port page->API hop is enough to make
// some browsers withhold the sameSite:'lax' session cookie on that subresource,
// leaving the owner anonymous so a still-pending photo 404s and renders as a
// broken/'corrupted' image. Serving photos from a same-origin /api path guarantees
// the cookie always rides. JSON services keep using VITE_API_BASE (absolute) and
// are unaffected.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
});
