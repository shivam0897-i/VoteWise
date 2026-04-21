import { describe, it, expect } from 'vitest';
import { formatTimeDiff } from '../src/modules/countdown.js';

describe('formatTimeDiff', () => {
  it('returns null for zero or negative values', () => {
    expect(formatTimeDiff(0)).toBeNull();
    expect(formatTimeDiff(-1000)).toBeNull();
  });

  it('formats seconds correctly', () => {
    expect(formatTimeDiff(5000)).toBe('0d 00h 00m 05s');
  });

  it('formats minutes and seconds', () => {
    expect(formatTimeDiff(125_000)).toBe('0d 00h 02m 05s');
  });

  it('formats hours, minutes, seconds', () => {
    // 3h 25m 10s = (3*3600 + 25*60 + 10) * 1000 = 12_310_000
    expect(formatTimeDiff(12_310_000)).toBe('0d 03h 25m 10s');
  });

  it('formats days correctly', () => {
    // 2d 5h 0m 0s
    const ms = (2 * 86400 + 5 * 3600) * 1000;
    expect(formatTimeDiff(ms)).toBe('2d 05h 00m 00s');
  });

  it('pads single-digit values', () => {
    // 1d 1h 1m 1s
    const ms = (86400 + 3600 + 60 + 1) * 1000;
    expect(formatTimeDiff(ms)).toBe('1d 01h 01m 01s');
  });
});
