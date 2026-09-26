import { describe, it, expect } from 'vitest';
import { buildQuiz, shuffle, scoreQuiz, scoreVerdict } from './quiz';
import type { Fallacy } from '../types';

function makeFallacy(id: string, scenarios = [`${id} scenario`]): Fallacy {
  return {
    id,
    name: id.toUpperCase(),
    aka: [],
    category: 'relevance',
    definition: 'd',
    example: 'e',
    flaw: 'f',
    quizScenarios: scenarios,
  };
}

// Deterministic LCG so shuffles are reproducible
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const POOL = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => makeFallacy(id, [`${id}1`, `${id}2`]));

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seeded(1));
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic for a given rng', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(7))).toEqual(shuffle([1, 2, 3, 4, 5], seeded(7)));
  });
});

describe('buildQuiz', () => {
  it('returns the requested number of questions', () => {
    expect(buildQuiz(POOL, { count: 5, rng: seeded(1) })).toHaveLength(5);
  });

  it('caps count at the total number of scenarios', () => {
    expect(buildQuiz(POOL, { count: 100, rng: seeded(1) })).toHaveLength(12);
  });

  it('never repeats a scenario', () => {
    const quiz = buildQuiz(POOL, { count: 12, rng: seeded(3) });
    expect(new Set(quiz.map((q) => q.scenario)).size).toBe(12);
  });

  it('prefers distinct fallacies before reusing one', () => {
    const quiz = buildQuiz(POOL, { count: 6, rng: seeded(4) });
    expect(new Set(quiz.map((q) => q.answerId)).size).toBe(6);
  });

  it('each question has unique options including the answer', () => {
    for (const q of buildQuiz(POOL, { count: 10, optionCount: 4, rng: seeded(5) })) {
      expect(q.optionIds).toHaveLength(4);
      expect(new Set(q.optionIds).size).toBe(4);
      expect(q.optionIds).toContain(q.answerId);
    }
  });

  it('scenario belongs to the answer fallacy', () => {
    for (const q of buildQuiz(POOL, { count: 12, rng: seeded(6) })) {
      const f = POOL.find((p) => p.id === q.answerId);
      expect(f?.quizScenarios).toContain(q.scenario);
    }
  });

  it('caps options at pool size', () => {
    const small = [makeFallacy('x'), makeFallacy('y')];
    const quiz = buildQuiz(small, { count: 2, optionCount: 4, rng: seeded(1) });
    expect(quiz[0].optionIds).toHaveLength(2);
  });

  it('returns empty for an empty pool', () => {
    expect(buildQuiz([], { count: 5 })).toEqual([]);
  });
});

describe('scoreQuiz', () => {
  const quiz = [
    { scenario: 's1', answerId: 'a', optionIds: ['a', 'b'] },
    { scenario: 's2', answerId: 'b', optionIds: ['a', 'b'] },
    { scenario: 's3', answerId: 'c', optionIds: ['c', 'd'] },
  ];

  it('counts correct answers', () => {
    expect(scoreQuiz(quiz, ['a', 'a', 'c'])).toEqual({ correct: 2, total: 3 });
  });

  it('treats missing answers as incorrect', () => {
    expect(scoreQuiz(quiz, ['a'])).toEqual({ correct: 1, total: 3 });
  });
});

describe('scoreVerdict', () => {
  it('praises 80% and above', () => {
    expect(scoreVerdict(8, 10)).toMatch(/sharp/i);
    expect(scoreVerdict(10, 10)).toMatch(/sharp/i);
  });

  it('encourages review between 50% and 80%', () => {
    expect(scoreVerdict(5, 10)).toMatch(/review/i);
    expect(scoreVerdict(7, 10)).toMatch(/review/i);
  });

  it('suggests the library below 50%', () => {
    expect(scoreVerdict(4, 10)).toMatch(/library/i);
    expect(scoreVerdict(0, 0)).toMatch(/library/i);
  });
});
