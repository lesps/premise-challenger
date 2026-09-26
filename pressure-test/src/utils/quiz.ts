import type { Fallacy, QuizQuestion } from '../types';

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface BuildQuizOptions {
  count: number;
  optionCount?: number;
  rng?: Rng;
}

/**
 * Builds a multiple-choice quiz. Scenarios are drawn round-robin across shuffled
 * fallacies so every fallacy appears once before any appears twice. Distractors
 * are random other fallacies from the same pool.
 */
export function buildQuiz(
  fallacies: readonly Fallacy[],
  { count, optionCount = 4, rng = Math.random }: BuildQuizOptions
): QuizQuestion[] {
  const queues = shuffle(fallacies, rng).map((f) => ({
    id: f.id,
    scenarios: shuffle(f.quizScenarios, rng),
  }));

  const picks: Array<{ id: string; scenario: string }> = [];
  for (let round = 0; picks.length < count; round++) {
    const available = queues.filter((q) => round < q.scenarios.length);
    if (available.length === 0) break;
    for (const q of available) {
      if (picks.length === count) break;
      picks.push({ id: q.id, scenario: q.scenarios[round] });
    }
  }

  const allIds = fallacies.map((f) => f.id);
  const distractorCount = Math.min(optionCount, allIds.length) - 1;

  return picks.map(({ id, scenario }) => {
    const distractors = shuffle(
      allIds.filter((other) => other !== id),
      rng
    ).slice(0, distractorCount);
    return { scenario, answerId: id, optionIds: shuffle([id, ...distractors], rng) };
  });
}

export function scoreQuiz(
  quiz: readonly QuizQuestion[],
  answers: ReadonlyArray<string | undefined>
): { correct: number; total: number } {
  const correct = quiz.filter((q, i) => answers[i] === q.answerId).length;
  return { correct, total: quiz.length };
}

export function scoreVerdict(correct: number, total: number): string {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio >= 0.8) return 'Sharp eye. You spot bad reasoning reliably.';
  if (ratio >= 0.5) return 'Solid. Review the misses below.';
  return 'Worth another pass through the library.';
}
