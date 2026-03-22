import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadPropositions,
  savePropositions,
  createProposition,
  updateProposition,
  deleteProposition,
  getProposition,
  getFilteredPropositions,
} from './storage';
import { STORAGE_KEY } from '../constants';
import type { Proposition } from '../types';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function seedProposition(overrides: Partial<Proposition> = {}): Proposition {
  const p = createProposition(overrides.claim ?? 'Test claim');
  if (Object.keys(overrides).length > 1 || (overrides.claim === undefined && Object.keys(overrides).length > 0)) {
    return updateProposition(p.id, overrides);
  }
  return p;
}

describe('loadPropositions', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(loadPropositions()).toEqual([]);
  });

  it('returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{');
    expect(loadPropositions()).toEqual([]);
  });

  it('returns parsed propositions when valid data exists', () => {
    const p = createProposition('A valid claim');
    expect(loadPropositions()).toHaveLength(1);
    expect(loadPropositions()[0].id).toBe(p.id);
  });

  it('returns empty array when data is valid JSON but not the expected shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
    expect(loadPropositions()).toEqual([]);
  });
});

describe('savePropositions', () => {
  it('persists to localStorage under correct key', () => {
    const p = createProposition('A claim');
    savePropositions([p]);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('overwrites previous data', () => {
    createProposition('First');
    createProposition('Second');
    expect(loadPropositions()).toHaveLength(2);
    savePropositions([]);
    expect(loadPropositions()).toHaveLength(0);
  });
});

describe('createProposition', () => {
  it('returns proposition with valid UUID', () => {
    const p = createProposition('Test claim');
    expect(p.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('sets status to untested', () => {
    expect(createProposition('Test claim').status).toBe('untested');
  });

  it('sets triage to null', () => {
    expect(createProposition('Test claim').triage).toBeNull();
  });

  it('sets created_at and updated_at to ISO timestamps', () => {
    const p = createProposition('Test claim');
    expect(() => new Date(p.created_at)).not.toThrow();
    expect(() => new Date(p.updated_at)).not.toThrow();
    expect(p.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(p.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('persists to storage (loadPropositions returns it)', () => {
    const p = createProposition('Persisted claim');
    const loaded = loadPropositions();
    expect(loaded.find((x) => x.id === p.id)).toBeDefined();
  });

  it('stores the claim text verbatim (trimmed)', () => {
    const p = createProposition('  Trimmed claim  ');
    expect(p.claim).toBe('Trimmed claim');
  });
});

describe('updateProposition', () => {
  it('merges partial updates into existing proposition', () => {
    const p = createProposition('Original');
    const updated = updateProposition(p.id, { claim: 'Updated' });
    expect(updated.claim).toBe('Updated');
    expect(updated.status).toBe('untested');
  });

  it('updates updated_at timestamp', async () => {
    const p = createProposition('Test');
    await new Promise((r) => setTimeout(r, 5));
    const updated = updateProposition(p.id, { status: 'confirmed' });
    expect(updated.updated_at >= p.updated_at).toBe(true);
  });

  it('does not modify created_at', () => {
    const p = createProposition('Test');
    const updated = updateProposition(p.id, { status: 'confirmed' });
    expect(updated.created_at).toBe(p.created_at);
  });

  it('throws descriptive error for nonexistent ID', () => {
    expect(() => updateProposition('nonexistent-id', { status: 'confirmed' })).toThrow(/nonexistent-id/);
  });

  it('persists changes', () => {
    const p = createProposition('Test');
    updateProposition(p.id, { status: 'confirmed' });
    expect(getProposition(p.id)?.status).toBe('confirmed');
  });
});

describe('deleteProposition', () => {
  it('removes proposition from storage', () => {
    const p = createProposition('To delete');
    deleteProposition(p.id);
    expect(getProposition(p.id)).toBeNull();
  });

  it('throws for nonexistent ID', () => {
    expect(() => deleteProposition('nonexistent-id')).toThrow();
  });

  it('does not affect other propositions', () => {
    const a = createProposition('Keep');
    const b = createProposition('Delete');
    deleteProposition(b.id);
    expect(getProposition(a.id)).not.toBeNull();
    expect(loadPropositions()).toHaveLength(1);
  });
});

describe('getProposition', () => {
  it('returns proposition by ID', () => {
    const p = createProposition('Find me');
    expect(getProposition(p.id)?.id).toBe(p.id);
  });

  it('returns null for nonexistent ID', () => {
    expect(getProposition('does-not-exist')).toBeNull();
  });
});

describe('getFilteredPropositions', () => {
  let currentTime = 1000000;

  beforeEach(() => {
    localStorage.clear();
    currentTime = 1000000;
    vi.useFakeTimers();
    vi.setSystemTime(currentTime);

    const p1 = createProposition('First');
    currentTime += 10;
    vi.setSystemTime(currentTime);
    updateProposition(p1.id, { status: 'confirmed' });

    currentTime += 10;
    vi.setSystemTime(currentTime);
    const p2 = createProposition('Second');
    currentTime += 10;
    vi.setSystemTime(currentTime);
    updateProposition(p2.id, { status: 'suspended' });

    currentTime += 10;
    vi.setSystemTime(currentTime);
    createProposition('Third'); // untested
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all propositions when no filters applied', () => {
    expect(getFilteredPropositions()).toHaveLength(3);
  });

  it('filters by status', () => {
    const confirmed = getFilteredPropositions({ status: 'confirmed' });
    expect(confirmed).toHaveLength(1);
    expect(confirmed[0].status).toBe('confirmed');
  });

  it('sorts by created_at ascending', () => {
    const results = getFilteredPropositions({ sortField: 'created_at', sortDirection: 'asc' });
    expect(results[0].claim).toBe('First');
    expect(results[2].claim).toBe('Third');
  });

  it('sorts by updated_at descending (default)', () => {
    const results = getFilteredPropositions();
    // Most recently updated is Third (created last, no additional update shifts ordering)
    expect(results[0].claim).toBe('Third');
  });

  it('sorts by status alphabetically', () => {
    const results = getFilteredPropositions({ sortField: 'status', sortDirection: 'asc' });
    // confirmed < suspended < untested
    expect(results[0].status).toBe('confirmed');
    expect(results[1].status).toBe('suspended');
    expect(results[2].status).toBe('untested');
  });

  it('combined filter + sort works correctly', () => {
    const p4 = createProposition('Fourth');
    updateProposition(p4.id, { status: 'confirmed' });
    const results = getFilteredPropositions({ status: 'confirmed', sortField: 'created_at', sortDirection: 'asc' });
    expect(results).toHaveLength(2);
    expect(results[0].claim).toBe('First');
    expect(results[1].claim).toBe('Fourth');
  });
});
