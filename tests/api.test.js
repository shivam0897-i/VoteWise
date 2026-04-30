import { afterEach, describe, expect, it, vi } from 'vitest';

function geminiText(text) {
  return {
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
  };
}

describe('Gemini API transport', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    window.APP_CONFIG = undefined;
  });

  it('uses the configured Cloud Function proxy when available', async () => {
    window.APP_CONFIG = {
      GEMINI_PROXY_URL: 'https://votewise-gemini-proxy.example.run.app',
      GEMINI_MODEL: 'gemini-test',
    };
    const fetchMock = vi.fn().mockResolvedValue(geminiText('Proxy response'));
    vi.stubGlobal('fetch', fetchMock);

    const { chatCompletion } = await import('../src/modules/api.js');
    const reply = await chatCompletion('System rules', [], 'Hello');

    expect(reply).toBe('Proxy response');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://votewise-gemini-proxy.example.run.app');
    expect(JSON.parse(init.body)).toMatchObject({
      feature: 'chat',
      request: {
        system_instruction: { parts: [{ text: 'System rules' }] },
      },
    });
  });

  it('requires the Cloud Function proxy instead of using browser secrets', async () => {
    window.APP_CONFIG = {
      GEMINI_PROXY_URL: '',
      GEMINI_MODEL: 'gemini-test',
    };
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { generateJSON } = await import('../src/modules/api.js');

    await expect(generateJSON('Return JSON')).rejects.toThrow('GEMINI_PROXY_URL is not configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
