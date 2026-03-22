import { describe, it, expect } from 'vitest';
import { detectHedgeWords, isValidClaim } from './validation';

describe('detectHedgeWords', () => {
  it('returns empty array for clean claims', () => {
    expect(detectHedgeWords('Dogs are better than cats.')).toEqual([]);
  });

  it('detects single hedge word: "Maybe dogs are better"', () => {
    expect(detectHedgeWords('Maybe dogs are better')).toContain('maybe');
  });

  it('detects multi-word hedge phrase: "I think markets will correct"', () => {
    expect(detectHedgeWords('I think markets will correct')).toContain('i think');
  });

  it('is case insensitive: "PROBABLY not ideal"', () => {
    expect(detectHedgeWords('PROBABLY not ideal')).toContain('probably');
  });

  it('does not false-positive on substrings: "The mayor announced..."', () => {
    expect(detectHedgeWords('The mayor announced the new policy')).toEqual([]);
  });

  it('does not false-positive: "She sorted the list"', () => {
    expect(detectHedgeWords('She sorted the list')).toEqual([]);
  });

  it('detects multiple hedge words in one claim', () => {
    const result = detectHedgeWords('Maybe I think this is probably true');
    expect(result).toContain('maybe');
    expect(result).toContain('i think');
    expect(result).toContain('probably');
  });

  it('handles empty string (returns empty array)', () => {
    expect(detectHedgeWords('')).toEqual([]);
  });

  it('handles whitespace-only string (returns empty array)', () => {
    expect(detectHedgeWords('   ')).toEqual([]);
  });
});

describe('isValidClaim', () => {
  it('valid: "The market will correct in Q3."', () => {
    expect(isValidClaim('The market will correct in Q3.')).toEqual({ valid: true });
  });

  it('invalid (empty): ""', () => {
    const result = isValidClaim('');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('invalid (whitespace): "   "', () => {
    const result = isValidClaim('   ');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('invalid (too short): "Hi"', () => {
    const result = isValidClaim('Hi');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('invalid (hedge word): "I think the market will correct"', () => {
    const result = isValidClaim('I think the market will correct');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('returns reason string for each failure mode', () => {
    expect(isValidClaim('').reason).toBeTypeOf('string');
    expect(isValidClaim('Hi').reason).toBeTypeOf('string');
    expect(isValidClaim('Maybe something').reason).toBeTypeOf('string');
  });

  it('trims whitespace before validation', () => {
    expect(isValidClaim('  The market will correct in Q3.  ')).toEqual({ valid: true });
  });
});
