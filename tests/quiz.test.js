import { describe, it, expect } from 'vitest';
import { validateQuizData } from '../src/modules/quiz.js';

describe('validateQuizData', () => {
  const validData = {
    questions: [
      { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'E1' },
      { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correct: 1, explanation: 'E2' },
      { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correct: 2, explanation: 'E3' },
      { question: 'Q4?', options: ['A', 'B', 'C', 'D'], correct: 3, explanation: 'E4' },
      { question: 'Q5?', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'E5' },
    ],
  };

  it('accepts valid quiz data', () => {
    expect(validateQuizData(validData)).toBe(true);
  });

  it('rejects null or undefined', () => {
    expect(validateQuizData(null)).toBe(false);
    expect(validateQuizData(undefined)).toBe(false);
  });

  it('rejects missing questions array', () => {
    expect(validateQuizData({})).toBe(false);
    expect(validateQuizData({ questions: 'not an array' })).toBe(false);
  });

  it('rejects wrong number of questions', () => {
    expect(validateQuizData({ questions: validData.questions.slice(0, 3) })).toBe(false);
  });

  it('rejects question with wrong number of options', () => {
    const bad = structuredClone(validData);
    bad.questions[0].options = ['A', 'B'];
    expect(validateQuizData(bad)).toBe(false);
  });

  it('rejects correct index out of range', () => {
    const bad = structuredClone(validData);
    bad.questions[0].correct = 4;
    expect(validateQuizData(bad)).toBe(false);
  });

  it('rejects negative correct index', () => {
    const bad = structuredClone(validData);
    bad.questions[0].correct = -1;
    expect(validateQuizData(bad)).toBe(false);
  });

  it('rejects missing explanation', () => {
    const bad = structuredClone(validData);
    delete bad.questions[0].explanation;
    expect(validateQuizData(bad)).toBe(false);
  });
});
