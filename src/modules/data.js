/**
 * Data loading and normalization.
 */

import { DATA_FEED_URL } from '../config/constants.js';
import { FALLBACK_ELECTION_DATA } from '../data/electionData.js';
import { fetchLiveElectionData, mergeLiveData } from './liveData.js';

/**
 * Load election data from an optional remote JSON feed,
 * then enrich it with real-time AI-sourced updates.
 * Falls back to the local curated dataset when no URL is configured or fetch
 * fails, so the hackathon demo works reliably offline.
 * @param {string} [feedUrl] Optional override used by tests or custom callers.
 * @returns {Promise<{data: object, meta: {mode: string, error?: string, live?: boolean}}>}
 */
export async function loadElectionData(feedUrl = DATA_FEED_URL) {
  let baseData;
  let meta;

  if (!feedUrl) {
    baseData = normalizeData(FALLBACK_ELECTION_DATA);
    meta = { mode: 'local-fallback' };
  } else {
    try {
      const res = await fetch(feedUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Data feed returned ${res.status}`);
      const remote = await res.json();
      baseData = normalizeData(remote);
      meta = { mode: 'remote-feed' };
    } catch (err) {
      baseData = normalizeData(FALLBACK_ELECTION_DATA);
      meta = { mode: 'local-fallback', error: err.message };
    }
  }

  // Enrich with real-time data from Gemini + Google Search
  try {
    const live = await fetchLiveElectionData();
    if (live) {
      baseData = normalizeData(mergeLiveData(baseData, live));
      meta.live = true;
    }
  } catch {
    // Live enrichment is best-effort; continue with base data
  }

  return { data: baseData, meta };
}

/**
 * Ensure optional arrays exist and events are sorted.
 * @param {object} data
 * @returns {object}
 */
export function normalizeData(data) {
  const clone = structuredClone(data);
  clone.events = [...(clone.events || [])].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
  clone.regions = clone.regions || [];
  clone.journey = clone.journey || [];
  clone.tools = clone.tools || [];
  clone.chatSuggestions = clone.chatSuggestions || [];
  clone.officialSources = clone.officialSources || [];
  return clone;
}

/**
 * Find a source record by id.
 * @param {object} data
 * @param {string} id
 * @returns {{id: string, label: string, href: string} | undefined}
 */
export function findSource(data, id) {
  return data.officialSources.find((source) => source.id === id);
}

/**
 * Find the next event after now.
 * @param {Array<object>} events
 * @param {Date} [now]
 * @param {(event: object) => boolean} [filter]
 * @returns {object | null}
 */
export function getNextEvent(events, now = new Date(), filter = () => true) {
  const time = now.getTime();
  return events.find((event) => filter(event) && new Date(event.startsAt).getTime() > time) || null;
}

/**
 * Format a date in India-friendly terms.
 * @param {string} value
 * @returns {string}
 */
export function formatIndiaDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

/**
 * Format only the calendar date in India-friendly terms.
 * @param {string} value
 * @returns {string}
 */
export function formatIndiaDateOnly(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}
