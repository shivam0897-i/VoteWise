/**
 * Gemini API client.
 *
 * The API key is read from the VITE_GEMINI_API_KEY environment variable.
 * For a production public deployment, put this behind a small server or
 * Apps Script proxy so the key is never exposed to the browser.
 */

import { ENABLE_SEARCH_GROUNDING, GEMINI_API_KEY, GEMINI_ENDPOINT } from '../config/constants.js';

/**
 * Return the configured Gemini API key.
 * @returns {string}
 * @throws {Error} if no key is configured.
 */
export function getApiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.');
  }
  return GEMINI_API_KEY;
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

  const data = await postToGemini(body);
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
  });

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function postToGemini(body) {
  const key = getApiKey();
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  return res.json();
}
