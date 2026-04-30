import { describe, expect, it } from 'vitest';
import { buildQuizPrompt, validateQuizData } from '../src/modules/quiz.js';
import { FALLBACK_ELECTION_DATA } from '../src/data/electionData.js';

describe('buildQuizPrompt', () => {
  it('includes the cycle summary in the prompt', () => {
    const prompt = buildQuizPrompt(FALLBACK_ELECTION_DATA);
    expect(prompt).toContain(FALLBACK_ELECTION_DATA.cycle.summary);
  });

  it('includes all journey step titles', () => {
    const prompt = buildQuizPrompt(FALLBACK_ELECTION_DATA);
    FALLBACK_ELECTION_DATA.journey.forEach((step) => {
      expect(prompt).toContain(step.title);
    });
  });

  it('specifies exactly 5 questions and 4 options in the schema', () => {
    const prompt = buildQuizPrompt(FALLBACK_ELECTION_DATA);
    expect(prompt).toContain('exactly 5');
    expect(prompt).toContain('4 options');
  });

  it('returns valid JSON schema instructions', () => {
    const prompt = buildQuizPrompt(FALLBACK_ELECTION_DATA);
    expect(prompt).toContain('"questions"');
    expect(prompt).toContain('"correct"');
    expect(prompt).toContain('"explanation"');
  });

  it('enforces neutral, process-focused content rules', () => {
    const prompt = buildQuizPrompt(FALLBACK_ELECTION_DATA);
    expect(prompt).toMatch(/neutral/i);
    expect(prompt).toMatch(/partisan/i);
  });
});

describe('validateQuizData', () => {
  const validQuestion = {
    question: 'What is EVM?',
    options: ['A', 'B', 'C', 'D'],
    correct: 0,
    explanation: 'EVM stands for Electronic Voting Machine.',
  };

  const makeValid = () => ({
    questions: Array.from({ length: 5 }, () => ({ ...validQuestion })),
  });

  it('accepts a well-formed quiz payload', () => {
    expect(validateQuizData(makeValid())).toBe(true);
  });

  it('rejects null / non-object', () => {
    expect(validateQuizData(null)).toBe(false);
    expect(validateQuizData(42)).toBe(false);
  });

  it('rejects missing questions array', () => {
    expect(validateQuizData({})).toBe(false);
  });

  it('rejects fewer than 5 questions', () => {
    const q = makeValid();
    q.questions = q.questions.slice(0, 3);
    expect(validateQuizData(q)).toBe(false);
  });

  it('rejects a question with wrong number of options', () => {
    const q = makeValid();
    q.questions[0] = { ...validQuestion, options: ['A', 'B', 'C'] };
    expect(validateQuizData(q)).toBe(false);
  });

  it('rejects a question with out-of-range correct index', () => {
    const q = makeValid();
    q.questions[0] = { ...validQuestion, correct: 5 };
    expect(validateQuizData(q)).toBe(false);
    q.questions[0] = { ...validQuestion, correct: -1 };
    expect(validateQuizData(q)).toBe(false);
  });

  it('rejects a question missing explanation', () => {
    const q = makeValid();
    q.questions[0] = { ...validQuestion, explanation: undefined };
    expect(validateQuizData(q)).toBe(false);
  });
});
