import { describe, it, expect } from 'vitest';
import { createElement, renderSafeText } from '../src/modules/dom.js';

describe('createElement', () => {
  it('creates an element with the correct tag', () => {
    const el = createElement('div');
    expect(el.tagName).toBe('DIV');
  });

  it('sets text content safely', () => {
    const el = createElement('p', {}, 'Hello <script>alert("xss")</script>');
    expect(el.textContent).toBe('Hello <script>alert("xss")</script>');
    expect(el.innerHTML).toBe('Hello &lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  it('sets className via attrs', () => {
    const el = createElement('span', { className: 'badge badge--new' });
    expect(el.className).toBe('badge badge--new');
  });

  it('sets arbitrary attributes', () => {
    const el = createElement('button', { type: 'button', id: 'test-btn' });
    expect(el.getAttribute('type')).toBe('button');
    expect(el.id).toBe('test-btn');
  });

  it('sets dataset', () => {
    const el = createElement('div', { dataset: { query: 'What is EVM?' } });
    expect(el.dataset.query).toBe('What is EVM?');
  });
});

describe('renderSafeText', () => {
  it('renders plain text without html injection', () => {
    const parent = document.createElement('div');
    renderSafeText(parent, '<img src=x onerror=alert(1)>');
    expect(parent.innerHTML).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('converts newlines to br elements', () => {
    const parent = document.createElement('div');
    renderSafeText(parent, 'Line 1\nLine 2\nLine 3');
    const brs = parent.querySelectorAll('br');
    expect(brs.length).toBe(2);
    expect(parent.textContent).toBe('Line 1Line 2Line 3');
  });
});
