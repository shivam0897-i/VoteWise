import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp } from '../src/modules/render.js';
import { FALLBACK_ELECTION_DATA } from '../src/data/electionData.js';
import { normalizeData } from '../src/modules/data.js';

const DATA = normalizeData(FALLBACK_ELECTION_DATA);

function buildDOM() {
  document.body.innerHTML = `
    <span id="cycle-title"></span>
    <span id="cycle-summary"></span>
    <p id="data-status"></p>
    <div id="region-track"></div>
    <span id="timer-next-label"></span>
    <span id="timer-next-event"></span>
    <span id="timer-results-label"></span>
    <span id="timer-results"></span>
    <select id="readiness-state"></select>
    <div id="timeline"></div>
    <div id="simulator-steps"></div>
    <div id="tools-grid"></div>
    <div id="chat-chips"></div>
    <div id="sources-list"></div>
  `;
}

describe('renderApp', () => {
  beforeEach(buildDOM);

  it('sets the cycle title in the hero', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    expect(document.getElementById('cycle-title').textContent).toBe(DATA.cycle.title);
  });

  it('sets the cycle summary in the hero', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    expect(document.getElementById('cycle-summary').textContent).toBe(DATA.cycle.summary);
  });

  it('renders a region pill per region', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    const pills = document.querySelectorAll('.region-pill');
    expect(pills.length).toBe(DATA.regions.length);
  });

  it('region pills have accessible aria-label', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    document.querySelectorAll('.region-pill').forEach((pill) => {
      expect(pill.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('region track has role="list"', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    expect(document.getElementById('region-track').getAttribute('role')).toBe('list');
  });

  it('region pills have role="listitem"', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    document.querySelectorAll('.region-pill').forEach((pill) => {
      expect(pill.getAttribute('role')).toBe('listitem');
    });
  });

  it('populates the readiness state select with region options', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    const options = document.querySelectorAll('#readiness-state option');
    // +1 for the placeholder option added first
    expect(options.length).toBeGreaterThanOrEqual(DATA.regions.length);
  });

  it('renders a timeline step per journey entry', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    const steps = document.querySelectorAll('.timeline__step');
    expect(steps.length).toBe(DATA.journey.length);
  });

  it('renders tool cards', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    const cards = document.querySelectorAll('.tool-card');
    expect(cards.length).toBe(DATA.tools.length);
  });

  it('renders chat chips for each suggestion', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    const chips = document.querySelectorAll('.chip');
    expect(chips.length).toBe(DATA.chatSuggestions.length);
  });

  it('shows local-fallback data-status when no remote feed', () => {
    renderApp(DATA, { mode: 'local-fallback' });
    expect(document.getElementById('data-status').textContent).toContain('snapshot');
  });

  it('shows live indicator in data-status when live data loaded', () => {
    renderApp(DATA, { mode: 'local-fallback', live: true });
    expect(document.getElementById('data-status').textContent).toContain('Live');
  });
});
