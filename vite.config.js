/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const shouldExposeLocalPublicEnv = command === 'serve' || mode === 'test';
  const env = shouldExposeLocalPublicEnv ? loadEnv(mode, process.cwd(), '') : {};

  return {
    define: {
      __APP_ENV__: JSON.stringify({
        GEMINI_PROXY_URL: env.GEMINI_PROXY_URL || '',
        GEMINI_MODEL: env.GEMINI_MODEL || '',
        ELECTION_DATA_URL: env.ELECTION_DATA_URL || '',
        GOOGLE_MAPS_KEY: env.GOOGLE_MAPS_KEY || '',
        ENABLE_SEARCH_GROUNDING: env.ENABLE_SEARCH_GROUNDING || '',
      }),
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.js'],
    },
  };
});
