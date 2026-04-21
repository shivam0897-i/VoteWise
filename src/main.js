/**
 * Application entry point.
 */

import './styles/main.css';
import { initChat } from './modules/chat.js';
import { initCountdown } from './modules/countdown.js';
import { loadElectionData } from './modules/data.js';
import { initReadiness } from './modules/readiness.js';
import { renderApp } from './modules/render.js';
import { initSimulator } from './modules/simulator.js';
import { initTimeline } from './modules/timeline.js';
import { initQuiz } from './modules/quiz.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Show the page immediately — don't wait for API calls
  document.body.classList.remove('is-loading');

  const { data, meta } = await loadElectionData();
  renderApp(data, meta);

  // Initialize each module in its own error boundary so a failure in one
  // (e.g. missing DOM element, API issue) does not blank the entire page.
  const modules = [
    ['countdown', () => initCountdown(data)],
    ['timeline', () => initTimeline()],
    ['readiness', () => initReadiness(data)],
    ['simulator', () => initSimulator(data)],
    ['chat', () => initChat(data)],
    ['quiz', () => initQuiz(data)],
  ];

  for (const [name, init] of modules) {
    try {
      init();
    } catch (err) {
      console.error(`[VoteWise] Failed to initialize ${name}:`, err);
    }
  }
});
