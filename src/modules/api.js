/**
 * Gemini API client.
 *
 * All browser Gemini requests go through GEMINI_PROXY_URL, backed by the
 * Cloud Function in functions/gemini-proxy. The Gemini API key is never
 * injected into browser code.
 */

import {
  ENABLE_SEARCH_GROUNDING,
  GEMINI_PROXY_URL,
} from '../config/constants.js';

/**
 * Whether the app has a configured Gemini transport.
 * @returns {boolean}
 */
export function hasGeminiTransport() {
  return Boolean(GEMINI_PROXY_URL);
}

/**
 * Send a chat request to Gemini.
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
export async function chatCompletion(systemPrompt, history, userMessage) {
  const contents = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 256 },
    },
  };

  if (ENABLE_SEARCH_GROUNDING) {
    body.tools = [{ google_search: {} }];
  }

  const data = await postToGemini(body, 'chat');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
}

/**
 * Generate JSON from Gemini.
 * @param {string} prompt
 * @returns {Promise<object>}
 */
export async function generateJSON(prompt) {
  const data = await postToGemini({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  }, 'quiz');

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  // Strip optional markdown code fences that Gemini occasionally wraps around JSON.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Post a Gemini request through the configured transport.
 * @param {object} body
 * @param {string} feature
 * @returns {Promise<object>}
 */
export async function postToGemini(body, feature = 'general') {
  if (!GEMINI_PROXY_URL) {
    throw new Error('GEMINI_PROXY_URL is not configured.');
  }
  return postToProxy(body, feature);
}

/**
 * Forward a Gemini request body to the configured proxy URL.
 * @param {object} body - Gemini request payload.
 * @param {string} feature - Feature tag sent to the proxy for telemetry.
 * @returns {Promise<object>} Parsed Gemini response.
 */
async function postToProxy(body, feature) {
  const res = await fetch(GEMINI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature, request: body }),
  });

  if (!res.ok) throw new Error(await responseErrorMessage(res));

  return res.json();
}

async function responseErrorMessage(res) {
  const err = await res.json().catch(() => ({}));
  return err?.error?.message || err?.message || `API error ${res.status}`;
}
