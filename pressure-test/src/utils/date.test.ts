import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { relativeDate } from './date';

describe('relativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for < 60 seconds', () => {
    const iso = new Date(Date.now() - 30 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('just now');
  });

  it('returns "just now" for 0 seconds', () => {
    const iso = new Date(Date.now()).toISOString();
    expect(relativeDate(iso)).toBe('just now');
  });

  it('returns "Xm ago" for minutes', () => {
    const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('5m ago');
  });

  it('returns "Xm ago" for 59 minutes', () => {
    const iso = new Date(Date.now() - 59 * 60 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('59m ago');
  });

  it('returns "Xh ago" for hours', () => {
    const iso = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('3h ago');
  });

  it('returns "Xh ago" for 23 hours', () => {
    const iso = new Date(Date.now() - 23 * 3600 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('23h ago');
  });

  it('returns "Xd ago" for days', () => {
    const iso = new Date(Date.now() - 2 * 86400 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('2d ago');
  });

  it('returns "Xd ago" for 6 days', () => {
    const iso = new Date(Date.now() - 6 * 86400 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('6d ago');
  });

  it('returns "Xw ago" for weeks', () => {
    const iso = new Date(Date.now() - 14 * 86400 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('2w ago');
  });

  it('returns "Xw ago" for 4 weeks', () => {
    const iso = new Date(Date.now() - 28 * 86400 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('4w ago');
  });

  it('returns formatted date for > 30 days', () => {
    const iso = new Date(Date.now() - 35 * 86400 * 1000).toISOString();
    const result = relativeDate(iso);
    expect(result).toMatch(/[A-Z][a-z]+ \d+, \d{4}/);
  });

  it('handles future dates gracefully (returns "just now")', () => {
    const iso = new Date(Date.now() + 60 * 1000).toISOString();
    expect(relativeDate(iso)).toBe('just now');
  });

  it('handles invalid date strings (returns "Unknown")', () => {
    expect(relativeDate('not-a-date')).toBe('Unknown');
  });

  it('handles empty string (returns "Unknown")', () => {
    expect(relativeDate('')).toBe('Unknown');
  });
});
