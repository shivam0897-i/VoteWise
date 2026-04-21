/**
 * Personalized voter readiness checker.
 */

import { createElement } from './dom.js';

/**
 * Pure decision function for readiness cards.
 * @param {{region: string, age: string, roll: string, epic: string, support: string}} answers
 * @param {object} data
 * @returns {{tone: string, title: string, steps: string[], links: Array<{label: string, href: string}>}}
 */
export function evaluateReadiness(answers, data) {
  const region = data.regions.find((item) => item.name === answers.region);
  const links = [
    { label: 'Check voter roll', href: 'https://electoralsearch.eci.gov.in' },
    { label: 'Open voter services', href: 'https://voters.eci.gov.in' },
  ];

  if (answers.age === 'underage') {
    return {
      tone: 'calm',
      title: 'You are not eligible to vote yet.',
      steps: [
        'You can still learn the process and prepare documents early.',
        'Eligible citizens can register around the January 1, April 1, July 1, and October 1 qualifying dates.',
      ],
      links,
    };
  }

  if (answers.roll !== 'yes') {
    return {
      tone: 'urgent',
      title: answers.roll === 'no' ? 'Your first task is voter-roll inclusion.' : 'Check the roll before anything else.',
      steps: [
        'A name on the electoral roll is mandatory for voting.',
        answers.roll === 'no'
          ? 'Use Form 6 for new registration, or Form 8 if your existing details need correction or shifting.'
          : 'Search by EPIC or personal details on the official electoral search portal.',
        region ? `${region.name}: ${region.nextAction}` : 'Choose your state or UT for cycle-specific guidance.',
      ],
      links,
    };
  }

  const steps = [
    'You have cleared the most important condition: your name is on the electoral roll.',
    answers.epic === 'no'
      ? 'Carry one approved alternate photo ID such as Aadhaar, passport, driving licence, PAN card, MNREGA job card, or UDID card.'
      : 'Carry your EPIC or another accepted photo ID to the polling station.',
    'Find your polling booth before leaving. Phones and cameras are not allowed inside the polling booth.',
  ];

  if (answers.support === 'pwd85') {
    steps.push('If you are marked as PwD or are above 85, check whether home voting or polling-station assistance applies to you.');
  }

  if (region?.status === 'voted') {
    steps.push(`${region.name} has already polled in this cycle. The next milestone is counting and results.`);
    return {
      tone: 'done',
      title: 'You are in post-poll mode.',
      steps,
      links: [{ label: 'Open ECI results', href: 'https://results.eci.gov.in' }, ...links],
    };
  }

  if (region?.status === 'upcoming') {
    steps.push(`${region.name}: ${region.pollLabel}. ${region.nextAction}`);
  }

  return {
    tone: 'ready',
    title: 'You look poll-day ready.',
    steps,
    links,
  };
}

/**
 * Attach readiness form behavior.
 * @param {object} data
 */
export function initReadiness(data) {
  const form = document.getElementById('readiness-form');
  const result = document.getElementById('readiness-result');
  if (!form || !result) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const answers = {
      region: String(formData.get('region') || ''),
      age: String(formData.get('age') || ''),
      roll: String(formData.get('roll') || ''),
      epic: String(formData.get('epic') || ''),
      support: String(formData.get('support') || ''),
    };

    renderResult(result, evaluateReadiness(answers, data));
  });
}

function renderResult(container, outcome) {
  container.textContent = '';
  container.className = `readiness-result readiness-result--${outcome.tone}`;
  container.removeAttribute('hidden');
  container.appendChild(createElement('h3', {}, outcome.title));

  const list = createElement('ol');
  outcome.steps.forEach((step) => list.appendChild(createElement('li', {}, step)));
  container.appendChild(list);

  const actions = createElement('div', { className: 'readiness-result__actions' });
  outcome.links.forEach((link) => {
    actions.appendChild(createElement('a', {
      className: 'btn btn--small btn--ghost',
      href: link.href,
      target: '_blank',
      rel: 'noopener noreferrer',
    }, link.label));
  });
  container.appendChild(actions);
}
