export type TriageResult = 'pressure_test' | 'confirmed_intuition';

export type PropositionStatus = 'confirmed' | 'revised' | 'suspended' | 'untested';

export interface Proposition {
  id: string;
  created_at: string;
  updated_at: string;
  claim: string;
  triage: TriageResult | null;
  evidence: string | null;
  steelman: string | null;
  falsifiability: string | null;
  status: PropositionStatus;
  revision_note: string | null;
  resolution_note: string | null;
  revised_from: string | null;
}

export interface AppData {
  propositions: Proposition[];
}

export type SortField = 'created_at' | 'updated_at' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  status?: PropositionStatus | 'all';
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export interface ExportOptions {
  filterStatus?: PropositionStatus | 'all';
}
