/**
 * App-level constants that are not election facts.
 * Election facts live in src/data/electionData.js or in a remote JSON feed.
 */

export const GEMINI_MODEL = import.meta.env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

export const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

export const DATA_FEED_URL = import.meta.env?.VITE_ELECTION_DATA_URL || '';

export const ENABLE_SEARCH_GROUNDING =
  import.meta.env?.VITE_ENABLE_SEARCH_GROUNDING !== 'false';

export const GOOGLE_MAPS_KEY = import.meta.env?.VITE_GOOGLE_MAPS_KEY || '';

export const SCORE_MESSAGES = {
  5: 'Democracy champion. You can explain the process to someone else.',
  4: 'Strong score. You know the main voter journey and poll-day steps.',
  3: 'Good start. Review the timeline once and try again.',
  2: 'You are getting there. Focus on voter roll, ID, and polling booth steps.',
  1: 'Start with the readiness checker and the polling booth walk-through.',
  0: 'No problem. The app is built for learning from zero.',
};
