/**
 * Polling booth simulator.
 */

import { createElement } from './dom.js';
import { GOOGLE_MAPS_KEY } from '../config/constants.js';

let activeIndex = 0;

/** Cached user coordinates (null = not yet asked, false = denied). */
let userCoords = null;

/**
 * Initialize simulator controls.
 * @param {object} data
 */
export function initSimulator(data) {
  const panel = document.getElementById('simulator-panel');
  const steps = document.getElementById('simulator-steps');
  const next = document.getElementById('simulator-next');
  const prev = document.getElementById('simulator-prev');
  if (!panel || !steps) return;

  const render = () => renderStep(data, panel, steps);
  render();

  steps.addEventListener('click', (event) => {
    const button = event.target.closest('.sim-step');
    if (!button) return;
    activeIndex = Number(button.dataset.index || 0);
    render();
  });

  next?.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % data.simulator.length;
    render();
  });

  prev?.addEventListener('click', () => {
    activeIndex = (activeIndex - 1 + data.simulator.length) % data.simulator.length;
    render();
  });
}

function renderStep(data, panel, steps) {
  const step = data.simulator[activeIndex];
  panel.textContent = '';
  panel.dataset.progress = String(activeIndex + 1);

  const icon = createElement('span', { className: 'material-icons simulator-card__icon', ariaHidden: 'true' }, step.icon);
  const eyebrow = createElement('p', { className: 'simulator-card__eyebrow' }, `Step ${activeIndex + 1} of ${data.simulator.length}`);
  const title = createElement('h3', {}, step.title);
  const text = createElement('p', {}, step.text);

  panel.append(icon, eyebrow, title, text);

  // Show booth finder panel on "Find your booth" step (step 0)
  if (activeIndex === 0) {
    panel.appendChild(buildBoothFinder());
  }

  steps.querySelectorAll('.sim-step').forEach((button, index) => {
    const isActive = index === activeIndex;
    button.classList.toggle('sim-step--active', isActive);
    button.setAttribute('aria-current', isActive ? 'step' : 'false');
  });
}

/* ─── Booth Finder Panel ─── */

/**
 * Build the complete booth finder panel with EPIC search,
 * official links, and optional map.
 * @returns {HTMLElement}
 */
function buildBoothFinder() {
  const finder = createElement('div', { className: 'booth-finder' });

  // ── Section 1: EPIC Search ──
  finder.appendChild(buildEpicSearch());

  // ── Section 2: Quick Actions Grid ──
  finder.appendChild(buildQuickActions());

  // ── Section 3: Small Map (if API key available) ──
  if (GOOGLE_MAPS_KEY) {
    finder.appendChild(buildMiniMap());
  }

  return finder;
}

/**
 * Build the EPIC number search form.
 * Opens ECI electoral search in a new tab.
 */
function buildEpicSearch() {
  const section = createElement('div', { className: 'booth-finder__epic' });

  const label = createElement('label', {
    className: 'booth-finder__label',
    htmlFor: 'epic-input',
  });
  label.appendChild(createElement('span', { className: 'material-icons', ariaHidden: 'true' }, 'badge'));
  label.appendChild(document.createTextNode(' Enter your Voter ID (EPIC) number'));
  section.appendChild(label);

  const row = createElement('div', { className: 'booth-finder__input-row' });

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'epic-input';
  input.className = 'booth-finder__input';
  input.placeholder = 'e.g. ABC1234567';
  input.maxLength = 20;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-label', 'Voter ID EPIC number');

  const btn = createElement('button', {
    className: 'btn btn--primary booth-finder__search-btn',
    type: 'button',
  });
  btn.appendChild(createElement('span', { className: 'material-icons', ariaHidden: 'true' }, 'search'));
  btn.appendChild(document.createTextNode(' Find Booth'));

  btn.addEventListener('click', () => {
    const epic = input.value.trim().toUpperCase();
    if (!epic) {
      input.focus();
      input.classList.add('booth-finder__input--shake');
      setTimeout(() => input.classList.remove('booth-finder__input--shake'), 500);
      return;
    }
    // Validate EPIC format: 3 letters followed by 7 digits (e.g. ABC1234567)
    const EPIC_REGEX = /^[A-Z]{3}\d{7}$/;
    if (!EPIC_REGEX.test(epic)) {
      input.setCustomValidity('EPIC format: 3 letters + 7 digits (e.g. ABC1234567)');
      input.reportValidity();
      input.setCustomValidity('');
      return;
    }
    // Open ECI electoral search — the official booth lookup
    window.open(`https://electoralsearch.eci.gov.in/`, '_blank', 'noopener');
  });

  // Also trigger on Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click();
  });

  row.append(input, btn);
  section.appendChild(row);

  const hint = createElement('p', { className: 'booth-finder__hint' });
  hint.textContent = 'Your EPIC number is printed on your Voter ID card (top-left corner).';
  section.appendChild(hint);

  return section;
}

/**
 * Build the quick-action links grid.
 */
function buildQuickActions() {
  const grid = createElement('div', { className: 'booth-finder__actions' });

  const actions = [
    {
      icon: 'how_to_vote',
      title: 'NVSP Portal',
      desc: 'Check voter registration & details',
      href: 'https://www.nvsp.in/',
    },
    {
      icon: 'call',
      title: 'Voter Helpline',
      desc: 'Call 1950 or use the app',
      href: 'https://voterportal.eci.gov.in/',
    },
    {
      icon: 'sms',
      title: 'SMS Service',
      desc: 'Send EPIC No. to 1950',
      href: null, // no link, just info
    },
    {
      icon: 'smart_toy',
      title: 'Ask VoteWise',
      desc: 'Chat with AI for booth help',
      href: '#chatbot',
    },
  ];

  actions.forEach((action) => {
    const tag = action.href ? 'a' : 'div';
    const card = document.createElement(tag);
    card.className = 'booth-finder__action-card';
    if (action.href) {
      card.href = action.href;
      if (!action.href.startsWith('#')) {
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
      }
    } else {
      // Non-interactive info card — mark for AT as a note so it is not confused with a link
      card.setAttribute('role', 'note');
    }

    card.appendChild(createElement('span', {
      className: 'material-icons booth-finder__action-icon',
      ariaHidden: 'true',
    }, action.icon));
    card.appendChild(createElement('strong', {}, action.title));
    card.appendChild(createElement('small', {}, action.desc));
    grid.appendChild(card);
  });

  return grid;
}

/**
 * Build a small location-aware map for spatial context.
 */
function buildMiniMap() {
  const section = createElement('div', { className: 'booth-finder__map' });

  const mapLabel = createElement('p', { className: 'booth-finder__map-label' });
  mapLabel.appendChild(createElement('span', { className: 'material-icons', ariaHidden: 'true' }, 'map'));
  mapLabel.appendChild(document.createTextNode(' Your area on the map'));
  section.appendChild(mapLabel);

  // Try geolocation
  const mapContainer = createElement('div', { className: 'booth-finder__map-container' });
  section.appendChild(mapContainer);

  if (userCoords === false) {
    insertMapIframe(mapContainer, null);
  } else if (userCoords) {
    insertMapIframe(mapContainer, userCoords);
  } else if ('geolocation' in navigator) {
    // Show loading
    const loader = createElement('div', { className: 'booth-finder__map-loading' });
    loader.appendChild(createElement('span', { className: 'material-icons', ariaHidden: 'true' }, 'my_location'));
    loader.appendChild(createElement('span', {}, 'Detecting location…'));
    mapContainer.appendChild(loader);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapContainer.textContent = '';
        insertMapIframe(mapContainer, userCoords);
      },
      () => {
        userCoords = false;
        mapContainer.textContent = '';
        insertMapIframe(mapContainer, null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  } else {
    userCoords = false;
    insertMapIframe(mapContainer, null);
  }

  return section;
}

/**
 * Insert the Google Maps Embed iframe.
 */
function insertMapIframe(container, coords) {
  const iframe = document.createElement('iframe');

  let src = `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_KEY}&q=polling+station`;
  if (coords) {
    src += `&center=${coords.lat},${coords.lng}&zoom=14`;
  } else {
    src += `&center=20.5937,78.9629&zoom=5`;
  }

  iframe.src = src;
  iframe.width = '100%';
  iframe.height = '180';
  iframe.style.border = '0';
  iframe.style.borderRadius = '8px';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  iframe.setAttribute('aria-label', 'Map of your area');
  container.appendChild(iframe);
}
