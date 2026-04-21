/**
 * VoteWise chat module.
 */

import { chatCompletion } from './api.js';
import { createElement, renderSafeText } from './dom.js';

const history = [];
const MAX_HISTORY = 20;
let isSending = false;
let lastSendTime = 0;
const SEND_COOLDOWN_MS = 3000;

/**
 * Initialize chat behavior.
 * @param {object} data
 */
export function initChat(data) {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const chipsContainer = document.getElementById('chat-chips');

  if (!form || !input) return;

  appendBubble('bot', buildWelcome(data));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    input.value = '';
    send(data, text);
  });

  chipsContainer?.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    const query = chip.dataset.query;
    if (query) send(data, query);
  });
}

async function send(data, text) {
  if (!text || isSending) return;

  // Client-side rate limiting: enforce cooldown between requests
  const now = Date.now();
  if (now - lastSendTime < SEND_COOLDOWN_MS) {
    setStatus('Please wait a moment before sending another message.');
    setTimeout(() => setStatus(''), 2000);
    return;
  }

  appendBubble('user', text);
  setStatus('Checking official context...');
  isSending = true;
  lastSendTime = now;

  try {
    const reply = await chatCompletion(buildSystemPrompt(data), history, text);
    history.push({ role: 'user', content: text });
    history.push({ role: 'model', content: reply });
    // Trim history to prevent unbounded token growth
    while (history.length > MAX_HISTORY) history.shift();
    appendBubble('bot', reply);
  } catch (err) {
    console.error('[VoteWise chat]', err);
    const fallbackReply = buildLocalReply(data, text, err);
    history.push({ role: 'user', content: text });
    history.push({ role: 'model', content: fallbackReply });
    while (history.length > MAX_HISTORY) history.shift();
    appendBubble('bot', fallbackReply, true);
  } finally {
    setStatus('');
    isSending = false;
  }
}

function appendBubble(sender, text, isFallback = false) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = createElement('div', {
    className: `chat__bubble chat__bubble--${sender}${isFallback ? ' chat__bubble--fallback' : ''}`,
  });
  renderSafeText(bubble, text);
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function setStatus(text) {
  const el = document.getElementById('chat-status');
  if (el) el.textContent = text;
}

function buildWelcome(data) {
  return `Ask me about registration, forms, polling day, IDs, accessibility, or the ${data.cycle.title}. I stay neutral and point you to official sources.`;
}

/**
 * Data-backed fallback for moments when Gemini is unavailable or overloaded.
 * It keeps the chat useful during demos without pretending to be AI generated.
 * @param {object} data
 * @param {string} text
 * @param {Error} err
 * @returns {string}
 */
export function buildLocalReply(data, text, err = new Error()) {
  const query = text.toLowerCase();
  const prefix = `Gemini is unavailable right now, so I am answering from the verified VoteWise dataset instead.\n\n`;

  if (query.includes('epic') || query.includes('id') || query.includes('voter id')) {
    return `${prefix}Yes, you may still be able to vote without EPIC if your name appears on the electoral roll. Carry an approved alternate photo ID such as Aadhaar, passport, driving licence, PAN card, MNREGA job card, or UDID card.\n\nNext step: check your name at electoralsearch.eci.gov.in before polling day.`;
  }

  if (query.includes('form 6') || query.includes('register') || query.includes('registration')) {
    return `${prefix}Use Form 6 for new voter registration. Use Form 8 for correction, address shifting, replacement EPIC, or PwD marking. General voters can apply through voters.eci.gov.in.\n\nNext step: open voters.eci.gov.in and choose the form that matches your case.`;
  }

  if (query.includes('form') || query.includes('address') || query.includes('correct')) {
    return `${prefix}For most correction or shifting cases, use Form 8. Form 6 is for new voter registration, and Form 6A is for overseas Indian electors.\n\nNext step: use voters.eci.gov.in and keep address/identity proof ready.`;
  }

  if (query.includes('booth') || query.includes('polling') || query.includes('vote') || query.includes('evm') || query.includes('vvpat')) {
    return `${prefix}At the booth, officials check your name and ID, mark your finger, issue a slip, record your signature in Form 17A, and let you vote on the EVM. After pressing the button, verify the VVPAT slip while it is visible.\n\nNext step: find your assigned polling station before leaving home.`;
  }

  if (query.includes('85') || query.includes('pwd') || query.includes('disabled') || query.includes('home')) {
    return `${prefix}Home voting may apply for voters above 85 years and PwD voters marked in the electoral roll, where notified. It is optional and must be requested within the notified window.\n\nNext step: check official voter services or contact the Returning Officer for your constituency.`;
  }

  if (query.includes('count') || query.includes('result') || query.includes('date') || query.includes('when')) {
    const events = data.events
      .map((event) => `${event.label}: ${new Date(event.startsAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}`)
      .join('\n');
    return `${prefix}Here are the dates currently loaded in VoteWise:\n${events}\n\nNext step: use the official ECI results portal on counting day.`;
  }

  return `${prefix}I can still help with voter registration, roll checks, accepted ID, polling-booth steps, accessibility support, campaign rules, and counting dates. The live AI error was: ${err.message || 'temporary API issue'}.\n\nTry one of the suggested questions or ask about a specific step.`;
}

/**
 * Build a dynamic system prompt from currently loaded election data.
 * @param {object} data
 * @returns {string}
 */
export function buildSystemPrompt(data) {
  const compactContext = {
    lastVerified: data.lastVerified,
    cycle: data.cycle,
    events: data.events,
    regions: data.regions,
    journey: data.journey.map((step) => ({
      step: step.step,
      title: step.title,
      phase: step.phase,
      details: step.details,
    })),
    sources: data.officialSources,
  };

  return `You are VoteWise, a neutral Indian election-process assistant.

Rules:
- Help users understand election process, timelines, forms, voter readiness, polling day, accessibility, and official services.
- Do not recommend parties or candidates. Do not persuade users how to vote.
- If the user asks for political preference, campaign strategy, or partisan messaging, refuse briefly and redirect to neutral process help.
- Use the provided app context for known election-cycle facts.
- If Google Search grounding is available, verify recent or date-sensitive facts before answering.
- Keep answers concise, practical, and easy for a first-time voter.
- End with one clear next action when useful.
- Mention official sources by name when a factual answer depends on them.

App context:
${JSON.stringify(compactContext)}`;
}
