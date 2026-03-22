import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePropositions } from './usePropositions';

beforeEach(() => {
  localStorage.clear();
});

describe('usePropositions', () => {
  it('loads existing propositions from storage on mount', () => {
    // Seed storage before hook mounts
    const { result: seedResult } = renderHook(() => usePropositions());
    act(() => {
      seedResult.current.createProposition('Pre-seeded claim');
    });

    // Mount a fresh hook instance
    const { result } = renderHook(() => usePropositions());
    expect(result.current.propositions).toHaveLength(1);
    expect(result.current.propositions[0].claim).toBe('Pre-seeded claim');
  });

  it('createProposition adds to state and storage', () => {
    const { result } = renderHook(() => usePropositions());
    act(() => {
      result.current.createProposition('New claim');
    });
    expect(result.current.propositions).toHaveLength(1);
    expect(result.current.propositions[0].claim).toBe('New claim');
  });

  it('updateProposition modifies state and storage', () => {
    const { result } = renderHook(() => usePropositions());
    let id = '';
    act(() => {
      const p = result.current.createProposition('To update');
      id = p.id;
    });
    act(() => {
      result.current.updateProposition(id, { status: 'confirmed' });
    });
    expect(result.current.propositions.find((p) => p.id === id)?.status).toBe('confirmed');
  });

  it('deleteProposition removes from state and storage', () => {
    const { result } = renderHook(() => usePropositions());
    let id = '';
    act(() => {
      const p = result.current.createProposition('To delete');
      id = p.id;
    });
    act(() => {
      result.current.deleteProposition(id);
    });
    expect(result.current.propositions.find((p) => p.id === id)).toBeUndefined();
  });

  it('setFilters updates filteredPropositions reactively', () => {
    const { result } = renderHook(() => usePropositions());
    act(() => {
      result.current.createProposition('Claim A');
    });
    act(() => {
      const p = result.current.createProposition('Claim B');
      result.current.updateProposition(p.id, { status: 'confirmed' });
    });
    act(() => {
      result.current.setFilters({ status: 'confirmed' });
    });
    expect(result.current.filteredPropositions).toHaveLength(1);
    expect(result.current.filteredPropositions[0].status).toBe('confirmed');
  });

  it('getProposition returns correct item or null', () => {
    const { result } = renderHook(() => usePropositions());
    let id = '';
    act(() => {
      const p = result.current.createProposition('Find me');
      id = p.id;
    });
    expect(result.current.getProposition(id)).not.toBeNull();
    expect(result.current.getProposition('nonexistent')).toBeNull();
  });
});
