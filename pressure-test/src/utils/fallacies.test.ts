import { describe, it, expect } from 'vitest';
import { filterFallacies } from './fallacies';
import type { Fallacy } from '../types';

const base: Omit<Fallacy, 'id' | 'name' | 'category'> = {
  aka: [],
  definition: 'd',
  example: 'e',
  flaw: 'f',
  quizScenarios: ['s'],
};

const LIST: Fallacy[] = [
  { ...base, id: 'straw-man', name: 'Straw Man', category: 'relevance' },
  { ...base, id: 'post-hoc', name: 'Post Hoc', category: 'causal', aka: ['False cause'] },
  { ...base, id: 'sunk-cost', name: 'Sunk Cost', category: 'presumption', definition: 'Past investment drives the choice.' },
];

describe('filterFallacies', () => {
  it('returns everything for category "all" and empty query', () => {
    expect(filterFallacies(LIST, { category: 'all', query: '' })).toHaveLength(3);
  });

  it('filters by category', () => {
    expect(filterFallacies(LIST, { category: 'causal', query: '' }).map((f) => f.id)).toEqual(['post-hoc']);
  });

  it('matches name case-insensitively', () => {
    expect(filterFallacies(LIST, { category: 'all', query: 'STRAW' }).map((f) => f.id)).toEqual(['straw-man']);
  });

  it('matches aliases and definitions', () => {
    expect(filterFallacies(LIST, { category: 'all', query: 'false cause' }).map((f) => f.id)).toEqual(['post-hoc']);
    expect(filterFallacies(LIST, { category: 'all', query: 'investment' }).map((f) => f.id)).toEqual(['sunk-cost']);
  });

  it('ignores surrounding whitespace in the query', () => {
    expect(filterFallacies(LIST, { category: 'all', query: '  hoc ' })).toHaveLength(1);
  });

  it('combines category and query', () => {
    expect(filterFallacies(LIST, { category: 'relevance', query: 'hoc' })).toEqual([]);
  });
});
