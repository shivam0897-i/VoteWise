import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Minimal election data fixture
const SIMULATOR_DATA = {
  simulator: [
    { icon: 'location_on', title: 'Find your booth', text: 'Locate your polling station using your EPIC number.' },
    { icon: 'badge', title: 'Show your ID', text: 'Present your Voter ID or approved alternate photo ID.' },
    { icon: 'touch_app', title: 'Cast your vote', text: 'Press the button next to your chosen candidate on the EVM.' },
    { icon: 'receipt_long', title: 'Verify VVPAT slip', text: 'Watch the VVPAT window for 7 seconds to verify your vote.' },
    { icon: 'ink_drop', title: 'Indelible ink', text: 'Get indelible ink marked on your left index finger.' },
  ],
};

function buildDOM() {
  // Step buttons are normally rendered by render.js (renderSimulatorShell).
  // Pre-render them here so initSimulator can wire up events and update active state.
  const stepButtons = SIMULATOR_DATA.simulator
    .map((_, i) => `<button class="sim-step" data-index="${i}" type="button" aria-current="false">${i + 1}</button>`)
    .join('');
  document.body.innerHTML = `
    <div id="simulator-steps">${stepButtons}</div>
    <article id="simulator-panel" aria-live="polite"></article>
    <button id="simulator-prev" type="button">Back</button>
    <button id="simulator-next" type="button">Next</button>
  `;
}

describe('simulator module', () => {
  beforeEach(buildDOM);
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    window.APP_CONFIG = undefined;
  });

  it('renders the first step on init', async () => {
    window.APP_CONFIG = { GEMINI_PROXY_URL: '', GOOGLE_MAPS_KEY: '' };
    const { initSimulator } = await import('../src/modules/simulator.js');
    initSimulator(SIMULATOR_DATA);

    const panel = document.getElementById('simulator-panel');
    expect(panel.querySelector('h3').textContent).toBe('Find your booth');
    expect(panel.dataset.progress).toBe('1');
  });

  it('advances to the next step when next button is clicked', async () => {
    window.APP_CONFIG = { GEMINI_PROXY_URL: '', GOOGLE_MAPS_KEY: '' };
    const { initSimulator } = await import('../src/modules/simulator.js');
    initSimulator(SIMULATOR_DATA);

    document.getElementById('simulator-next').click();
    const panel = document.getElementById('simulator-panel');
    expect(panel.querySelector('h3').textContent).toBe('Show your ID');
    expect(panel.dataset.progress).toBe('2');
  });

  it('wraps around from last step to first on next click', async () => {
    window.APP_CONFIG = { GEMINI_PROXY_URL: '', GOOGLE_MAPS_KEY: '' };
    const { initSimulator } = await import('../src/modules/simulator.js');
    initSimulator(SIMULATOR_DATA);

    const next = document.getElementById('simulator-next');
    for (let i = 0; i < SIMULATOR_DATA.simulator.length; i++) next.click();

    const panel = document.getElementById('simulator-panel');
    expect(panel.querySelector('h3').textContent).toBe('Find your booth');
    expect(panel.dataset.progress).toBe('1');
  });

  it('goes to previous step when prev button is clicked', async () => {
    window.APP_CONFIG = { GEMINI_PROXY_URL: '', GOOGLE_MAPS_KEY: '' };
    const { initSimulator } = await import('../src/modules/simulator.js');
    initSimulator(SIMULATOR_DATA);

    document.getElementById('simulator-next').click();
    document.getElementById('simulator-prev').click();
    const panel = document.getElementById('simulator-panel');
    expect(panel.querySelector('h3').textContent).toBe('Find your booth');
  });

  it('marks the active step button with aria-current="step"', async () => {
    window.APP_CONFIG = { GEMINI_PROXY_URL: '', GOOGLE_MAPS_KEY: '' };
    const { initSimulator } = await import('../src/modules/simulator.js');
    initSimulator(SIMULATOR_DATA);

    document.getElementById('simulator-next').click();
    const buttons = document.querySelectorAll('.sim-step');
    expect(buttons[1].getAttribute('aria-current')).toBe('step');
    expect(buttons[0].getAttribute('aria-current')).toBe('false');
  });

  it('jumps to a step when its step button is clicked', async () => {
    window.APP_CONFIG = { GEMINI_PROXY_URL: '', GOOGLE_MAPS_KEY: '' };
    const { initSimulator } = await import('../src/modules/simulator.js');
    initSimulator(SIMULATOR_DATA);

    const buttons = document.querySelectorAll('.sim-step');
    buttons[3].click();
    const panel = document.getElementById('simulator-panel');
    expect(panel.querySelector('h3').textContent).toBe('Verify VVPAT slip');
    expect(panel.dataset.progress).toBe('4');
  });
});
