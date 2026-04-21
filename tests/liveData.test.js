import { describe, it, expect } from 'vitest';
import { mergeLiveData } from '../src/modules/liveData.js';

const BASE_DATA = {
  cycle: { title: '2026 Assembly Elections', summary: 'Base summary' },
  regions: [
    { name: 'Assam', seats: 126, status: 'upcoming', pollLabel: 'Polls on April 9' },
  ],
  events: [
    { id: 'phase-1', label: 'Phase 1', type: 'poll', startsAt: '2026-04-09T07:00:00+05:30' },
  ],
  journey: [{ step: 1, title: 'Register' }],
  tools: [{ id: 'roll-check' }],
};

describe('mergeLiveData', () => {
  it('overwrites summary from live data', () => {
    const live = { summary: 'Updated live summary' };
    const result = mergeLiveData(BASE_DATA, live);
    expect(result.cycle.summary).toBe('Updated live summary');
  });

  it('overwrites regions when live data provides them', () => {
    const live = {
      regions: [
        { name: 'Assam', seats: 126, status: 'voted', pollLabel: 'Polled on April 9' },
        { name: 'Kerala', seats: 140, status: 'upcoming', pollLabel: 'Polls on April 23' },
      ],
    };
    const result = mergeLiveData(BASE_DATA, live);
    expect(result.regions).toHaveLength(2);
    expect(result.regions[0].status).toBe('voted');
  });

  it('overwrites events when live data provides them', () => {
    const live = {
      events: [
        { id: 'phase-2', label: 'Phase 2', type: 'poll', startsAt: '2026-04-23T07:00:00+05:30' },
      ],
    };
    const result = mergeLiveData(BASE_DATA, live);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].id).toBe('phase-2');
  });

  it('sets lastVerified timestamp', () => {
    const live = { lastVerified: '2026-04-21T10:00:00Z' };
    const result = mergeLiveData(BASE_DATA, live);
    expect(result.lastVerified).toBe('2026-04-21T10:00:00Z');
  });

  it('preserves base journey and tools untouched', () => {
    const live = { summary: 'Updated', regions: [] };
    const result = mergeLiveData(BASE_DATA, live);
    expect(result.journey).toEqual(BASE_DATA.journey);
    expect(result.tools).toEqual(BASE_DATA.tools);
  });

  it('does not mutate the original base data', () => {
    const original = structuredClone(BASE_DATA);
    mergeLiveData(BASE_DATA, { summary: 'Changed' });
    expect(BASE_DATA).toEqual(original);
  });

  it('handles empty live data gracefully', () => {
    const result = mergeLiveData(BASE_DATA, {});
    expect(result.cycle.summary).toBe('Base summary');
    expect(result.regions).toEqual(BASE_DATA.regions);
    expect(result.events).toEqual(BASE_DATA.events);
  });
});
