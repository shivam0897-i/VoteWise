/**
 * Quiz module.
 */

import { SCORE_MESSAGES } from '../config/constants.js';
import { generateJSON } from './api.js';
import { createElement, showQuizState } from './dom.js';

const STATES = ['quiz-idle', 'quiz-loading', 'quiz-playing', 'quiz-scored', 'quiz-error'];

let questions = [];
let currentIdx = 0;
let score = 0;
let isSending = false;

export function validateQuizData(data) {
  if (!data || !Array.isArray(data.questions)) return false;
  if (data.questions.length !== 5) return false;
  return data.questions.every(
    (q) =>
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct === 'number' &&
      q.correct >= 0 &&
      q.correct <= 3 &&
      typeof q.explanation === 'string'
  );
}

/**
 * Initialize quiz controls.
 * @param {object} data
 */
export function initQuiz(data) {
  document.getElementById('quiz-start')?.addEventListener('click', () => start(data));
  document.getElementById('quiz-retry')?.addEventListener('click', () => {
    reset();
    start(data);
  });
  document.getElementById('quiz-retry-error')?.addEventListener('click', () => {
    reset();
    start(data);
  });
}

async function start(data) {
  if (isSending) return;
  isSending = true;
  showQuizState('quiz-loading', STATES.filter((state) => state !== 'quiz-loading'));
  score = 0;
  currentIdx = 0;

  try {
    const response = await generateJSON(buildQuizPrompt(data));
    if (!validateQuizData(response)) throw new Error('Invalid quiz format received from Gemini.');
    questions = response.questions;
    showQuizState('quiz-playing', STATES.filter((state) => state !== 'quiz-playing'));
    renderQuestion();
  } catch (err) {
    console.error('[Quiz]', err);
    const errMsg = document.getElementById('quiz-error-msg');
    if (errMsg) errMsg.textContent = `Quiz could not load: ${err.message}`;
    showQuizState('quiz-error', STATES.filter((state) => state !== 'quiz-error'));
  } finally {
    isSending = false;
  }
}

function renderQuestion() {
  const container = document.getElementById('quiz-playing');
  if (!container) return;
  container.textContent = '';

  const q = questions[currentIdx];
  container.appendChild(createElement('p', { className: 'quiz__progress' }, `Question ${currentIdx + 1} of 5`));
  container.appendChild(createElement('p', { className: 'quiz__question' }, q.question));

  const optionsDiv = createElement('div', { role: 'radiogroup', ariaLabel: 'Answer options' });
  q.options.forEach((option, index) => {
    const btn = createElement(
      'button',
      {
        className: 'quiz__option',
        type: 'button',
        dataset: { index: String(index) },
      },
      option
    );
    btn.addEventListener('click', () => handleAnswer(index, optionsDiv));
    optionsDiv.appendChild(btn);
  });
  container.appendChild(optionsDiv);
}

function handleAnswer(selected, optionsDiv) {
  const q = questions[currentIdx];
  const isCorrect = selected === q.correct;
  if (isCorrect) score += 1;

  optionsDiv.querySelectorAll('.quiz__option').forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.correct) btn.classList.add('quiz__option--correct');
    else if (index === selected) btn.classList.add('quiz__option--wrong');
  });

  const container = document.getElementById('quiz-playing');
  const feedback = createElement('div', {
    className: `quiz__feedback quiz__feedback--${isCorrect ? 'correct' : 'wrong'}`,
  });
  feedback.appendChild(createElement('strong', {}, isCorrect ? 'Correct' : 'Not quite'));
  feedback.appendChild(createElement('p', {}, q.explanation));

  const nextBtn = createElement(
    'button',
    { className: 'btn btn--primary', type: 'button' },
    currentIdx < 4 ? 'Next question' : 'See score'
  );
  nextBtn.addEventListener('click', () => {
    currentIdx += 1;
    if (currentIdx < 5) renderQuestion();
    else showScoreScreen();
  });
  feedback.appendChild(nextBtn);
  container.appendChild(feedback);
  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showScoreScreen() {
  showQuizState('quiz-scored', STATES.filter((state) => state !== 'quiz-scored'));
  const scoreEl = document.getElementById('quiz-final-score');
  const msgEl = document.getElementById('quiz-score-msg');
  if (scoreEl) scoreEl.textContent = String(score);
  if (msgEl) msgEl.textContent = SCORE_MESSAGES[score] || '';
}

function reset() {
  showQuizState('quiz-idle', STATES.filter((state) => state !== 'quiz-idle'));
}

/**
 * Build a quiz prompt from loaded data.
 * @param {object} data
 * @returns {string}
 */
export function buildQuizPrompt(data) {
  const topics = data.journey.map((step) => `${step.title}: ${step.short}`).join('\n');
  return `Generate exactly 5 multiple-choice questions about the Indian election process.

Use this current VoteWise context:
${data.cycle.summary}

Core topics:
${topics}

Return only valid JSON in this exact shape:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Brief explanation."
    }
  ]
}

Rules:
- Exactly 5 questions.
- Exactly 4 options per question.
- correct must be the zero-based index of the answer.
- Keep all questions neutral and process-focused.
- Avoid partisan content.`;
}
