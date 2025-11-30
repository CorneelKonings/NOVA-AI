import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using '.' instead of process.cwd() to avoid type issues if @types/node isn't perfect
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Inject the API key into the process.env object for the client
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});