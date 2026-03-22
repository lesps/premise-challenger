import { describe, it, expect } from 'vitest';
import { generateId } from './id';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateId', () => {
  it('returns a string matching UUID v4 format', () => {
    expect(generateId()).toMatch(UUID_V4_REGEX);
  });

  it('two consecutive calls return different values', () => {
    expect(generateId()).not.toBe(generateId());
  });

  it('returns 100 unique values in a loop (no collisions)', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
