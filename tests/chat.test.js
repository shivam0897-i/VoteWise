import { describe, expect, it } from 'vitest';
import { buildLocalReply } from '../src/modules/chat.js';
import { FALLBACK_ELECTION_DATA } from '../src/data/electionData.js';

describe('buildLocalReply', () => {
  it('answers EPIC questions from local data when Gemini is unavailable', () => {
    const reply = buildLocalReply(
      FALLBACK_ELECTION_DATA,
      'My name is on the roll but I do not have EPIC. Can I vote?',
      new Error('model overloaded')
    );

    expect(reply).toContain('verified VoteWise dataset');
    expect(reply).toContain('alternate photo ID');
    expect(reply).toContain('electoral roll');
  });

  it('answers date questions with loaded events', () => {
    const reply = buildLocalReply(FALLBACK_ELECTION_DATA, 'When are results?', new Error('offline'));

    expect(reply).toContain('Counting and results');
    expect(reply).toContain('4 May 2026');
  });
});
