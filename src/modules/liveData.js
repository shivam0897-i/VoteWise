/**
 * Live election data enrichment via Gemini AI with search grounding.
 *
 * On startup, this module asks Gemini (with Google Search) for the latest
 * election status updates, then merges them into the base election data.
 * This gives us genuinely real-time information through the Gemini proxy.
 */

import { ENABLE_SEARCH_GROUNDING } from '../config/constants.js';
import { hasGeminiTransport, postToGemini } from './api.js';

const LIVE_DATA_PROMPT = `You are a factual Indian election data assistant. Today's date is ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full', timeZone: 'Asia/Kolkata' })}.

Search for the LATEST information about the 2026 Indian Assembly Elections (Assam, Kerala, Puducherry, Tamil Nadu, West Bengal).

Return a JSON object with these fields:
{
  "summary": "A 2-3 sentence factual summary of the current election status. Which states have voted, which are upcoming, counting date.",
  "regions": [
    {
      "name": "State Name",
      "seats": 126,
      "status": "voted" | "upcoming" | "active",
      "pollLabel": "Polled on April 9" | "Polls on April 23" | "Polling in progress",
      "pollDate": "2026-04-09"
    }
  ],
  "events": [
    {
      "id": "event-id",
      "label": "Event name",
      "type": "poll" | "result",
      "startsAt": "2026-04-09T07:00:00+05:30",
      "status": "completed" | "upcoming" | "active",
      "regions": ["State1"]
    }
  ],
  "lastVerified": "${new Date().toISOString()}"
}

Rules:
- Use ONLY verified, factual data from official sources (ECI, PIB).
- Include ALL 5 regions: Assam, Kerala, Puducherry, Tamil Nadu, West Bengal.
- Include events for all polling phases AND counting/results.
- Dates must be ISO 8601 with +05:30 timezone.
- "status" for regions: "voted" if polling is done, "active" if polling is today, "upcoming" if not yet.
- Be precise with seat counts.`;

/**
 * Fetch live election updates from Gemini with search grounding.
 * Caches results in sessionStorage to avoid redundant API calls
 * within the same browser session.
 * Returns null if the request fails (caller should use base data).
 * @returns {Promise<object|null>}
 */
export async function fetchLiveElectionData() {
  if (!hasGeminiTransport() || !ENABLE_SEARCH_GROUNDING) {
    return null;
  }

  // Check session cache first to avoid redundant API calls
  try {
    const cached = sessionStorage.getItem('votewise_live_data');
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      // Cache is valid for 10 minutes
      if (Date.now() - ts < 10 * 60 * 1000) return data;
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — proceed with API call
  }

  try {
    const data = await postToGemini({
      contents: [{ role: 'user', parts: [{ text: LIVE_DATA_PROMPT }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    }, 'live-election-data');
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return null;

    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    // Basic validation
    if (!parsed.regions || !Array.isArray(parsed.regions) || parsed.regions.length === 0) {
      return null;
    }

    // Cache the result for this session
    try {
      sessionStorage.setItem('votewise_live_data', JSON.stringify({ data: parsed, ts: Date.now() }));
    } catch {
      // Quota exceeded or unavailable — non-critical
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Merge live data into the base election data.
 * Only overwrites dynamic fields (summary, regions, events, lastVerified).
 * Process data (journey, simulator, tools, etc.) is kept from base.
 * @param {object} base - The base election data from JSON
 * @param {object} live - The live data from Gemini
 * @returns {object}
 */
export function mergeLiveData(base, live) {
  const merged = structuredClone(base);

  if (live.summary) {
    merged.cycle.summary = live.summary;
  }

  if (live.regions?.length) {
    merged.regions = live.regions;
  }

  if (live.events?.length) {
    merged.events = live.events;
  }

  if (live.lastVerified) {
    merged.lastVerified = live.lastVerified;
  }

  return merged;
}
