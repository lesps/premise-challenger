import type { Fallacy, FallacyCategory } from '../types';

export interface FallacyFilter {
  category: FallacyCategory | 'all';
  query: string;
}

export function filterFallacies(fallacies: readonly Fallacy[], { category, query }: FallacyFilter): Fallacy[] {
  const q = query.trim().toLowerCase();
  return fallacies.filter((f) => {
    if (category !== 'all' && f.category !== category) return false;
    if (!q) return true;
    return [f.name, f.definition, ...f.aka].some((text) => text.toLowerCase().includes(q));
  });
}
