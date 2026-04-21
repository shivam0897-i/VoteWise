import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeData } from '../src/modules/data.js';

describe('public election data feed', () => {
  it('is valid JSON with required top-level sections', () => {
    const raw = readFileSync('public/election-data.json', 'utf8');
    const data = normalizeData(JSON.parse(raw));

    expect(data.schemaVersion).toBe(1);
    expect(data.cycle.title).toBeTruthy();
    expect(data.events.length).toBeGreaterThan(0);
    expect(data.regions.length).toBeGreaterThan(0);
    expect(data.journey.length).toBeGreaterThan(0);
    expect(data.officialSources.length).toBeGreaterThan(0);
  });
});
