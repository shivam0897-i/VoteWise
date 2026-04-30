/**
 * App-level constants that are not election facts.
 * Election facts live in src/data/electionData.js or in a remote JSON feed.
 */

const runtimeConfig = window.APP_CONFIG || {};
const buildConfig = typeof __APP_ENV__ === 'object' ? __APP_ENV__ : {};

function buildValue(key, fallback = '') {
  return buildConfig[key] || fallback;
}

function runtimeValue(key, placeholder, fallback = '') {
  if (!Object.prototype.hasOwnProperty.call(runtimeConfig, key)) return fallback;
  const value = runtimeConfig[key];
  return value !== null && value !== undefined && value !== placeholder ? String(value) : fallback;
}

export const GEMINI_MODEL = runtimeValue(
  'GEMINI_MODEL',
  '__GEMINI_MODEL__',
  buildValue('GEMINI_MODEL', 'gemini-2.5-flash')
);

export const GEMINI_PROXY_URL = runtimeValue(
  'GEMINI_PROXY_URL',
  '__GEMINI_PROXY_URL__',
  buildValue('GEMINI_PROXY_URL')
).replace(/\/$/, '');

export const DATA_FEED_URL = runtimeValue(
  'ELECTION_DATA_URL',
  '__ELECTION_DATA_URL__',
  buildValue('ELECTION_DATA_URL')
);

export const ENABLE_SEARCH_GROUNDING = runtimeValue(
  'ENABLE_SEARCH_GROUNDING',
  '__ENABLE_SEARCH_GROUNDING__',
  buildValue('ENABLE_SEARCH_GROUNDING', 'true')
) !== 'false';

export const GOOGLE_MAPS_KEY = runtimeValue(
  'GOOGLE_MAPS_KEY',
  '__GOOGLE_MAPS_KEY__',
  buildValue('GOOGLE_MAPS_KEY')
);

export const SCORE_MESSAGES = {
  5: 'Democracy champion. You can explain the process to someone else.',
  4: 'Strong score. You know the main voter journey and poll-day steps.',
  3: 'Good start. Review the timeline once and try again.',
  2: 'You are getting there. Focus on voter roll, ID, and polling booth steps.',
  1: 'Start with the readiness checker and the polling booth walk-through.',
  0: 'No problem. The app is built for learning from zero.',
};
