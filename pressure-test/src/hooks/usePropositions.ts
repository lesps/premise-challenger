import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Proposition, FilterOptions, ExportOptions } from '../types';
import * as storage from '../services/storage';
import { generateExport, downloadExport } from '../utils/export';

export interface UsePropositionsReturn {
  propositions: Proposition[];
  filteredPropositions: Proposition[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  createProposition: (claim: string) => Proposition;
  updateProposition: (id: string, updates: Partial<Proposition>) => Proposition;
  deleteProposition: (id: string) => void;
  getProposition: (id: string) => Proposition | null;
  exportData: (options?: ExportOptions) => void;
}

export function usePropositions(): UsePropositionsReturn {
  const [propositions, setPropositions] = useState<Proposition[]>(() =>
    storage.loadPropositions()
  );
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    setPropositions(storage.loadPropositions());
  }, []);

  // Filtering and sorting happen in-memory against the propositions array.
  // Recomputes only when propositions or filters change — avoids redundant re-sorts on unrelated renders.
  const filteredPropositions = useMemo(() => {
    const { status = 'all', sortField = 'updated_at', sortDirection = 'desc' } = filters;
    let results = status !== 'all' ? propositions.filter((p) => p.status === status) : propositions;
    results = [...results].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return results;
  }, [propositions, filters]);

  // Each mutation writes to localStorage via the storage service, then reloads the full
  // array back into React state. This keeps state authoritative from storage rather than
  // applying optimistic updates, which simplifies correctness across concurrent hook instances.
  const createProposition = useCallback((claim: string): Proposition => {
    const p = storage.createProposition(claim);
    setPropositions(storage.loadPropositions());
    return p;
  }, []);

  const updateProposition = useCallback(
    (id: string, updates: Partial<Proposition>): Proposition => {
      const p = storage.updateProposition(id, updates);
      setPropositions(storage.loadPropositions());
      return p;
    },
    []
  );

  const deleteProposition = useCallback((id: string): void => {
    storage.deleteProposition(id);
    setPropositions(storage.loadPropositions());
  }, []);

  const getProposition = useCallback((id: string): Proposition | null => {
    return storage.getProposition(id);
  }, []);

  const exportData = useCallback((options?: ExportOptions): void => {
    const { blob, filename } = generateExport(storage.loadPropositions(), options);
    downloadExport(blob, filename);
  }, []);

  return {
    propositions,
    filteredPropositions,
    filters,
    setFilters,
    createProposition,
    updateProposition,
    deleteProposition,
    getProposition,
    exportData,
  };
}
