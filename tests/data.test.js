import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_ELECTION_DATA } from '../src/data/electionData.js';

// Mock live data module so tests don't call Gemini API
vi.mock('../src/modules/liveData.js', () => ({
  fetchLiveElectionData: vi.fn().mockResolvedValue(null),
  mergeLiveData: vi.fn((base) => base),
}));

import { loadElectionData, normalizeData } from '../src/modules/data.js';

describe('loadElectionData', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses local fallback when no feed URL is configured', async () => {
    const { data, meta } = await loadElectionData('');

    expect(meta.mode).toBe('local-fallback');
    expect(data.cycle.title).toBe(FALLBACK_ELECTION_DATA.cycle.title);
  });

  it('loads and normalizes a remote feed when a URL is provided', async () => {
    const remoteData = normalizeData({
      ...FALLBACK_ELECTION_DATA,
      cycle: {
        ...FALLBACK_ELECTION_DATA.cycle,
        title: 'Remote Election Feed',
      },
      events: [
        {
          id: 'later',
          label: 'Later event',
          type: 'poll',
          startsAt: '2026-05-02T07:00:00+05:30',
          status: 'upcoming',
          regions: ['Test'],
        },
        {
          id: 'earlier',
          label: 'Earlier event',
          type: 'poll',
          startsAt: '2026-04-22T07:00:00+05:30',
          status: 'upcoming',
          regions: ['Test'],
        },
      ],
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => remoteData,
    });
    vi.stubGlobal('fetch', fetchMock);

    const { data, meta } = await loadElectionData('https://example.com/election-data.json');

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/election-data.json', { cache: 'no-store' });
    expect(meta.mode).toBe('remote-feed');
    expect(data.cycle.title).toBe('Remote Election Feed');
    expect(data.events.map((event) => event.id)).toEqual(['earlier', 'later']);
  });

  it('falls back to local data when the remote feed fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    const { data, meta } = await loadElectionData('https://example.com/missing.json');

    expect(meta.mode).toBe('local-fallback');
    expect(meta.error).toContain('404');
    expect(data.cycle.title).toBe(FALLBACK_ELECTION_DATA.cycle.title);
  });
});
