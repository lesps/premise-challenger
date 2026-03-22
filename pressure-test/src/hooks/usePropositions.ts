import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import type { Proposition, FilterOptions, ExportOptions } from '../types';
import * as storage from '../services/storage';
import { generateExport, downloadExport } from '../utils/export';
import { StorageContext } from '../context/StorageContext';

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
  const { setQuotaExceeded } = useContext(StorageContext);

  const [propositions, setPropositions] = useState<Proposition[]>(() =>
    storage.loadPropositions()
  );
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    setPropositions(storage.loadPropositions());
  }, []);

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

  const handleStorageError = useCallback(
    (e: unknown) => {
      if (e instanceof Error && e.message === 'QUOTA_EXCEEDED') {
        setQuotaExceeded(true);
        return;
      }
      throw e;
    },
    [setQuotaExceeded]
  );

  const createProposition = useCallback(
    (claim: string): Proposition => {
      try {
        const p = storage.createProposition(claim);
        setPropositions(storage.loadPropositions());
        return p;
      } catch (e) {
        handleStorageError(e);
        throw e;
      }
    },
    [handleStorageError]
  );

  const updateProposition = useCallback(
    (id: string, updates: Partial<Proposition>): Proposition => {
      try {
        const p = storage.updateProposition(id, updates);
        setPropositions(storage.loadPropositions());
        return p;
      } catch (e) {
        handleStorageError(e);
        throw e;
      }
    },
    [handleStorageError]
  );

  const deleteProposition = useCallback(
    (id: string): void => {
      storage.deleteProposition(id);
      setPropositions(storage.loadPropositions());
    },
    []
  );

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
