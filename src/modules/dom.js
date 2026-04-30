/**
 * @fileoverview Safe DOM manipulation helpers.
 * Rule: NEVER use innerHTML for content that includes user input or API responses.
 * This module provides safe alternatives to prevent XSS.
 */

/**
 * Create a DOM element with attributes and text content.
 * @param {string} tag - HTML tag name.
 * @param {Object} [attrs] - Key-value attribute pairs. Use 'className' for class.
 * @param {string} [textContent] - Safe text content (not HTML).
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, textContent = '') {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key === 'htmlFor') {
      // Use the DOM property so the browser maps it to the 'for' attribute correctly.
      el.htmlFor = value;
    } else if (key.startsWith('aria')) {
      el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  if (textContent) {
    el.textContent = textContent;
  }
  return el;
}

/**
 * Append a safe text node to a parent element. For rendering API/user text
 * with line breaks converted to <br> safely.
 * @param {HTMLElement} parent - Container element.
 * @param {string} text - Raw text content.
 */
export function renderSafeText(parent, text) {
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    parent.appendChild(document.createTextNode(line));
    if (i < lines.length - 1) {
      parent.appendChild(document.createElement('br'));
    }
  });
}

/**
 * Shorthand: set element text (alias to avoid innerHTML).
 * @param {string} selector - CSS selector.
 * @param {string} text - Text content.
 */
export function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text || '';
}

/**
 * Show/hide a quiz state div by toggling the hidden class.
 * @param {string} showId - ID of the state div to show.
 * @param {string[]} hideIds - IDs of state divs to hide.
 */
export function showQuizState(showId, hideIds) {
  hideIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add('quiz__state--hidden');
  });
  const showEl = document.getElementById(showId);
  if (showEl) showEl.classList.remove('quiz__state--hidden');
}
