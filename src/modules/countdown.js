/**
 * Countdown timer logic.
 */

import { getNextEvent } from './data.js';

/**
 * Format a millisecond difference into a human-readable countdown string.
 * @param {number} diffMs
 * @returns {string | null}
 */
export function formatTimeDiff(diffMs) {
  if (diffMs <= 0) return null;
  const d = Math.floor(diffMs / 86_400_000);
  const h = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1000);
  return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

/**
 * Update countdown DOM elements.
 * @param {object} data
 */
function tick(data) {
  const now = new Date();
  const nextPoll = getNextEvent(data.events, now, (event) => event.type === 'poll');
  const nextResult = getNextEvent(data.events, now, (event) => event.type === 'result');

  updateTimer('timer-next-event', 'timer-next-label', nextPoll, now, 'Polling window started');
  updateTimer('timer-results', 'timer-results-label', nextResult, now, 'Results declared');
}

/**
 * Update one timer pair.
 * @param {string} valueId
 * @param {string} labelId
 * @param {object | null} event
 * @param {Date} now
 * @param {string} doneText
 */
function updateTimer(valueId, labelId, event, now, doneText) {
  const valueEl = document.getElementById(valueId);
  const labelEl = document.getElementById(labelId);
  if (!valueEl) return;

  if (!event) {
    valueEl.textContent = doneText;
    valueEl.classList.add('metric__value--done');
    if (labelEl) labelEl.textContent = 'No upcoming event';
    return;
  }

  const formatted = formatTimeDiff(new Date(event.startsAt).getTime() - now.getTime());
  valueEl.textContent = formatted || doneText;
  valueEl.classList.toggle('metric__value--done', !formatted);
  if (labelEl) labelEl.textContent = event.label;
}

/**
 * Initialise countdown updates.
 * @param {object} data
 */
export function initCountdown(data) {
  tick(data);
  setInterval(() => tick(data), 1000);
}
