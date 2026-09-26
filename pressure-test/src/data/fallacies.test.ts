import { describe, it, expect } from 'vitest';
import { FALLACIES, FALLACY_CATEGORIES, getFallacy } from './fallacies';

describe('FALLACIES data', () => {
  it('has unique ids', () => {
    const ids = FALLACIES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique names', () => {
    const names = FALLACIES.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every entry has non-empty text fields and a known category', () => {
    for (const f of FALLACIES) {
      expect(f.definition.trim(), f.id).not.toBe('');
      expect(f.example.trim(), f.id).not.toBe('');
      expect(f.flaw.trim(), f.id).not.toBe('');
      expect(FALLACY_CATEGORIES[f.category], f.id).toBeDefined();
    }
  });

  it('every entry has at least one quiz scenario distinct from its example', () => {
    for (const f of FALLACIES) {
      expect(f.quizScenarios.length, f.id).toBeGreaterThan(0);
      expect(f.quizScenarios, f.id).not.toContain(f.example);
    }
  });

  it('every category is represented', () => {
    for (const cat of Object.keys(FALLACY_CATEGORIES)) {
      expect(FALLACIES.some((f) => f.category === cat), cat).toBe(true);
    }
  });

  it('getFallacy finds by id and returns undefined otherwise', () => {
    expect(getFallacy('straw-man')?.name).toBe('Straw Man');
    expect(getFallacy('nope')).toBeUndefined();
  });
});
