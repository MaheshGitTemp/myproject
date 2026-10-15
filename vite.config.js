import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve on 127.0.0.1 (not localhost) so the browser page origin matches the API
// host (VITE_API_BASE=http://127.0.0.1:4000). Same-host keeps the session cookie
// (sameSite:'lax') attached on authed calls — otherwise a localhost page + a
// 127.0.0.1 API are different sites and the cookie is dropped (causing 401s).
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173 },
});
