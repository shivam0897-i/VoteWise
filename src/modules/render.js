/**
 * Data-driven UI rendering.
 */

import { createElement, setText } from './dom.js';
import { findSource, formatIndiaDateOnly, getNextEvent } from './data.js';

/**
 * Render all data-backed static UI.
 * @param {object} data
 * @param {{mode: string, error?: string}} meta
 */
export function renderApp(data, meta) {
  renderHero(data, meta);
  renderReadinessOptions(data);
  renderTimeline(data);
  renderSimulatorShell(data);
  renderTools(data);
  renderChatShell(data);
  renderSources(data);
}

function renderHero(data, meta) {
  setText('#cycle-title', data.cycle.title);
  setText('#cycle-summary', data.cycle.summary);
  setText('#data-status', buildDataStatus(data, meta));

  const track = document.getElementById('region-track');
  if (!track) return;
  track.textContent = '';

  data.regions.forEach((region) => {
    const statusLabel = region.status === 'active' ? 'voting in progress'
      : region.status === 'upcoming' ? 'upcoming election'
      : 'results declared';
    const item = createElement('article', {
      className: `region-pill region-pill--${region.status}`,
      tabIndex: '0',
      ariaLabel: `${region.name}: ${region.seats} seats, ${statusLabel}, polling ${region.pollLabel}`,
    });
    item.appendChild(createElement('span', { className: 'region-pill__name', ariaHidden: 'true' }, region.name));
    item.appendChild(createElement('span', { className: 'region-pill__meta', ariaHidden: 'true' }, `${region.seats} seats`));
    item.appendChild(createElement('span', { className: 'region-pill__date', ariaHidden: 'true' }, region.pollLabel));
    track.appendChild(item);
  });

  const nextPoll = getNextEvent(data.events, new Date(), (event) => event.type === 'poll');
  const nextResult = getNextEvent(data.events, new Date(), (event) => event.type === 'result');
  setText('#timer-next-label', nextPoll?.label || 'Polling');
  setText('#timer-results-label', nextResult?.label || 'Results');
}

function buildDataStatus(data, meta) {
  const verified = data.lastVerified ? formatIndiaDateOnly(data.lastVerified) : 'unknown date';
  const liveTag = meta.live ? ' 🔴 Live data enriched via AI.' : '';
  if (meta.mode === 'remote-feed') return `Live election feed loaded. Verified ${verified}.${liveTag}`;
  if (meta.error) return `Verified data snapshot: ${verified}. Live feed unavailable.${liveTag || ' Using local dataset.'}`;
  return `Verified data snapshot: ${verified}.${liveTag || ' Live feed can be connected with ELECTION_DATA_URL.'}`;
}

function renderReadinessOptions(data) {
  const select = document.getElementById('readiness-state');
  if (!select) return;
  select.textContent = '';
  select.appendChild(createElement('option', { value: '' }, data.readiness.statesPlaceholder));
  data.regions.forEach((region) => {
    select.appendChild(createElement('option', { value: region.name }, region.name));
  });
}

function renderTimeline(data) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  timeline.textContent = '';

  data.journey.forEach((step, index) => {
    const details = createElement('details', {
      className: `timeline__step timeline__step--${step.phase}`,
      role: 'listitem',
    });
    if (index === 0) details.open = true;

    const summary = createElement('summary', { className: 'timeline__summary' });
    summary.appendChild(createElement('span', { className: 'timeline__number', ariaHidden: 'true' }, String(step.step)));

    const label = createElement('span', { className: 'timeline__label' });
    label.appendChild(createElement('strong', {}, step.title));
    label.appendChild(createElement('span', {}, step.short));
    summary.appendChild(label);
    summary.appendChild(createElement('span', { className: `badge badge--${step.phase}` }, step.phase));
    details.appendChild(summary);

    const body = createElement('div', { className: 'timeline__body' });
    const list = createElement('ul');
    step.details.forEach((detail) => list.appendChild(createElement('li', {}, detail)));
    body.appendChild(list);

    const links = buildSourceLinks(data, step.sourceIds);
    if (links) body.appendChild(links);
    details.appendChild(body);
    timeline.appendChild(details);
  });
}

function buildSourceLinks(data, sourceIds = []) {
  const sources = sourceIds.map((id) => findSource(data, id)).filter(Boolean);
  if (!sources.length) return null;

  const wrap = createElement('div', { className: 'source-row', ariaLabel: 'Sources for this step' });
  sources.forEach((source) => {
    const link = createElement('a', {
      href: source.href,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'source-chip',
    }, source.label);
    wrap.appendChild(link);
  });
  return wrap;
}

function renderSimulatorShell(data) {
  const steps = document.getElementById('simulator-steps');
  if (!steps) return;
  steps.textContent = '';
  data.simulator.forEach((step, index) => {
    const node = createElement('button', {
      className: 'sim-step',
      type: 'button',
      dataset: { index: String(index) },
      ariaLabel: `Show step ${index + 1}: ${step.title}`,
    });
    node.appendChild(createElement('span', { className: 'material-icons', ariaHidden: 'true' }, step.icon));
    node.appendChild(createElement('span', { className: 'sim-step__number' }, String(index + 1)));
    steps.appendChild(node);
  });
}

function renderTools(data) {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;
  grid.textContent = '';

  data.tools.forEach((tool) => {
    const link = createElement('a', {
      href: tool.href,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'tool-card',
    });
    link.appendChild(createElement('span', { className: 'material-icons tool-card__icon', ariaHidden: 'true' }, tool.icon));
    link.appendChild(createElement('h3', { className: 'tool-card__title' }, tool.title));
    link.appendChild(createElement('p', { className: 'tool-card__desc' }, tool.description));
    link.appendChild(createElement('span', { className: 'tool-card__cta' }, 'Open official service'));
    grid.appendChild(link);
  });
}

function renderChatShell(data) {
  const chips = document.getElementById('chat-chips');
  if (!chips) return;
  chips.textContent = '';
  data.chatSuggestions.forEach((query) => {
    chips.appendChild(createElement('button', {
      className: 'chip',
      type: 'button',
      ariaLabel: `Ask VoteWise: ${query}`,
      dataset: { query },
    }, query));
  });
}

function renderSources(data) {
  const list = document.getElementById('sources-list');
  if (!list) return;
  list.textContent = '';
  data.officialSources.forEach((source) => {
    const item = createElement('a', {
      className: 'source-card',
      href: source.href,
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    item.appendChild(createElement('span', { className: 'material-icons', ariaHidden: 'true' }, 'verified'));
    item.appendChild(createElement('span', {}, source.label));
    list.appendChild(item);
  });
}


