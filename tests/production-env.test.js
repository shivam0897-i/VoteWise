import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FRONTEND_CONFIG_FILES = [
  '.env.example',
  'index.html',
  'entrypoint.sh',
  'vite.config.js',
  'src/config/constants.js',
  'src/modules/api.js',
];

describe('production environment wiring', () => {
  it('does not expose a browser-side Gemini API key configuration path', () => {
    const forbidden = [
      'VITE_GEMINI_API_KEY',
      '__GEMINI_API_KEY__',
      'GEMINI_ENDPOINT',
      'getApiKey',
    ];

    const combined = FRONTEND_CONFIG_FILES
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    forbidden.forEach((token) => {
      expect(combined).not.toContain(token);
    });
  });

  it('keeps the public runtime config limited to proxy and non-secret values', () => {
    const html = readFileSync('index.html', 'utf8');

    expect(html).toContain('GEMINI_PROXY_URL');
    expect(html).toContain('ELECTION_DATA_URL');
    expect(html).toContain('GOOGLE_MAPS_KEY');
    expect(html).toContain('ENABLE_SEARCH_GROUNDING');
    expect(html).not.toContain('GEMINI_API_KEY');
  });

  it('keeps local env files out of Docker builds', () => {
    const dockerignore = readFileSync('.dockerignore', 'utf8');

    expect(dockerignore).toContain('.env');
    expect(dockerignore).toContain('.env.*');
    expect(dockerignore).toContain('!.env.example');
  });
});
