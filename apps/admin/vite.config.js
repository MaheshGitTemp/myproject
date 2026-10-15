import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone admin app. Runs on 5174 so it can run alongside the member app (5173).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
});
