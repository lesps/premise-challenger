import type { Proposition, FilterOptions } from '../types';
import { STORAGE_KEY } from '../constants';
import { generateId } from '../utils/id';

// All propositions are stored as a single JSON array under one localStorage key.
// On parse error (corrupted data) or non-array shape, returns [] rather than throwing —
// the app degrades to an empty state rather than crashing.
export function loadPropositions(): Proposition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Proposition[];
  } catch {
    console.warn('Failed to load propositions from localStorage.');
    return [];
  }
}

// Quota exceeded errors (e.g. private browsing with low limits) are NOT caught here —
// they propagate to the caller so the UI can surface a warning banner.
export function savePropositions(propositions: Proposition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(propositions));
}

export function createProposition(claim: string): Proposition {
  const now = new Date().toISOString();
  const proposition: Proposition = {
    id: generateId(),
    created_at: now,
    updated_at: now,
    claim: claim.trim(),
    triage: null,
    evidence: null,
    steelman: null,
    falsifiability: null,
    status: 'untested',
    revision_note: null,
    resolution_note: null,
    revised_from: null,
  };
  const all = loadPropositions();
  savePropositions([...all, proposition]);
  return proposition;
}

export function updateProposition(
  id: string,
  updates: Partial<Omit<Proposition, 'id' | 'created_at'>>
): Proposition {
  const all = loadPropositions();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Proposition with id "${id}" not found.`);
  }
  const updated: Proposition = {
    ...all[index],
    ...updates,
    id: all[index].id,
    created_at: all[index].created_at,
    updated_at: new Date().toISOString(),
  };
  const next = [...all];
  next[index] = updated;
  savePropositions(next);
  return updated;
}

export function deleteProposition(id: string): void {
  const all = loadPropositions();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Proposition with id "${id}" not found.`);
  }
  savePropositions(all.filter((p) => p.id !== id));
}

export function getProposition(id: string): Proposition | null {
  return loadPropositions().find((p) => p.id === id) ?? null;
}

export function getFilteredPropositions(options: FilterOptions = {}): Proposition[] {
  const { status = 'all', sortField = 'updated_at', sortDirection = 'desc' } = options;

  let results = loadPropositions();

  if (status !== 'all') {
    results = results.filter((p) => p.status === status);
  }

  results = [...results].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  return results;
}
