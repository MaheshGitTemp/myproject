import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone admin app. Runs on 5174 so it can run alongside the member app (5173).
// Host pinned to 127.0.0.1 so the page origin matches the API host (127.0.0.1:4000)
// and the session cookie is sent on authed calls (same reason as the member app).
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5174 },
});
