import { describe, it, expect } from 'vitest';
import { evaluateReadiness } from '../src/modules/readiness.js';

const MOCK_DATA = {
  regions: [
    { name: 'Tamil Nadu', status: 'upcoming', pollLabel: 'Polls on April 23', nextAction: 'Check booth slip' },
    { name: 'Assam', status: 'voted', pollLabel: 'Polled on April 9', nextAction: 'Await results' },
    { name: 'Kerala', status: 'upcoming', pollLabel: 'Polls on April 23', nextAction: 'Check booth slip' },
  ],
};

const baseAnswers = {
  region: 'Tamil Nadu',
  age: 'eligible',
  roll: 'yes',
  epic: 'yes',
  support: 'none',
};

describe('evaluateReadiness', () => {
  it('rejects underage voters with calm tone', () => {
    const result = evaluateReadiness({ ...baseAnswers, age: 'underage' }, MOCK_DATA);
    expect(result.tone).toBe('calm');
    expect(result.title).toContain('not eligible');
    expect(result.steps[0]).toContain('learn the process');
  });

  it('flags missing roll entry as urgent', () => {
    const result = evaluateReadiness({ ...baseAnswers, roll: 'no' }, MOCK_DATA);
    expect(result.tone).toBe('urgent');
    expect(result.title).toContain('voter-roll inclusion');
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('Form 6')])
    );
  });

  it('flags unsure roll as urgent with search guidance', () => {
    const result = evaluateReadiness({ ...baseAnswers, roll: 'unsure' }, MOCK_DATA);
    expect(result.tone).toBe('urgent');
    expect(result.title).toContain('Check the roll');
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('Search by EPIC')])
    );
  });

  it('includes region-specific nextAction for roll-missing users', () => {
    const result = evaluateReadiness({ ...baseAnswers, roll: 'no', region: 'Tamil Nadu' }, MOCK_DATA);
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('Tamil Nadu')])
    );
  });

  it('returns ready tone for eligible voter with roll + EPIC', () => {
    const result = evaluateReadiness(baseAnswers, MOCK_DATA);
    expect(result.tone).toBe('ready');
    expect(result.title).toContain('poll-day ready');
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('EPIC')])
    );
  });

  it('adds alternate ID guidance when EPIC is missing', () => {
    const result = evaluateReadiness({ ...baseAnswers, epic: 'no' }, MOCK_DATA);
    expect(result.tone).toBe('ready');
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('alternate photo ID')])
    );
  });

  it('adds PwD/85+ guidance when support is flagged', () => {
    const result = evaluateReadiness({ ...baseAnswers, support: 'pwd85' }, MOCK_DATA);
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('home voting')])
    );
  });

  it('returns done tone for a region that has already voted', () => {
    const result = evaluateReadiness({ ...baseAnswers, region: 'Assam' }, MOCK_DATA);
    expect(result.tone).toBe('done');
    expect(result.title).toContain('post-poll');
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('already polled')])
    );
    expect(result.links[0].href).toContain('results.eci.gov.in');
  });

  it('adds upcoming poll info for regions yet to vote', () => {
    const result = evaluateReadiness({ ...baseAnswers, region: 'Kerala' }, MOCK_DATA);
    expect(result.tone).toBe('ready');
    expect(result.steps).toEqual(
      expect.arrayContaining([expect.stringContaining('Polls on April 23')])
    );
  });

  it('always includes official ECI links', () => {
    const result = evaluateReadiness(baseAnswers, MOCK_DATA);
    const hrefs = result.links.map((l) => l.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        'https://electoralsearch.eci.gov.in',
        'https://voters.eci.gov.in',
      ])
    );
  });
});
